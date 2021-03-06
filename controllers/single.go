package controllers

import (
	"errors"
	"fmt"
	"github.com/astaxie/beego"
	"github.com/stianeikeland/go-rpio"
	"strconv"
	"time"
)

var (
	Ch          = make(chan string)
	Status bool = false
)

//Single 单进程开启led灯
func (c *LedController) Single() {
	Msg := &Msg{
		Code: "success",
		//Info: "",
	}
	//灯序号映射为树莓派引脚的map
	var (
		P   map[int]string
		Gid int64
	)
	//获取参数，需传入打开的灯的ID和打开时长
	Waittime, err := strconv.ParseInt(c.Input().Get("waittime"), 10, 64)
	if err != nil {
		//如果未参入等待时长，则从配置文件中获取默认等待时间
		Waittime, err = strconv.ParseInt(beego.AppConfig.String("default_waittime"), 10, 64)
		if err != nil {
			beego.Error("默认等待时间default_waittime未配置或未非数字")
		}
		beego.Info("未传入等待关闭时间或非数字错误,将使用默认值", Waittime)
	}
	//获取闪烁间隔时间
	Flashtime, err := strconv.ParseInt(c.Input().Get("flashtime"), 10, 64)
	if err != nil || Flashtime < 20 {
		//beego.Info("未传入闪烁时间、或者为非数字错误、或者小于20毫秒")
		Flashtime = 0
	}
	//获取关闭的灯
	Cid, err := strconv.ParseInt(c.Input().Get("cid"), 10, 64)
	if err != nil {
		beego.Info("未传入需要关闭的LED ID或参数错误")
	} else {
		// 如果存在Closeid则执行关闭
		if Cid > 0 && Cid <= 98 {
			//停止协程
			if Status == true {
				Ch <- "stop"
			}
			time.Sleep(8 * time.Millisecond) //等待协程关闭
			//先获取cid对应的针脚id映射
			P, Gid = Oid2Pin(Cid)
			ClosedLEDs(P)
			//beego.Info(res)
			Msg.Code = "success"
			Msg.Info = "关闭" + fmt.Sprintf("%d", Cid) + "号LED成功"
			beego.Info(Msg.Info)
			c.Ctx.Output.SetStatus(200)
		} else {
			Msg.Code = "error"
			Msg.Info = "cid不是1-98的整数数字"
			c.Ctx.Output.SetStatus(400)
		}
	}

	Oid, err1 := strconv.ParseInt(c.Input().Get("oid"), 10, 64)
	if err1 != nil {
		//如果前面的cid也未传入，则直接报错
		if err != nil {
			Msg.Code = "error"
			Msg.Info = fmt.Sprintf("%v;", Msg.Info) + "oid和cid值都非法或都不存在，将不进行任何操作"
			beego.Error("oid和cid值都非法或都不存在，将不进行任何操作")
			c.Ctx.Output.SetStatus(400)
		}
		//此种情况说明仅传入了cid，因此直接返回前面关闭是否成功消息
		beego.Error("oid值非法或不存在，但存在Cid")
	} else if Oid > 0 && Oid <= 98 {
		//停止协程
		if Status == true {
			Ch <- "stop"
		}
		time.Sleep(8 * time.Millisecond) //等待协程关闭
		//再次关闭所有灯
		for i := 0; i < 29; i++ {
			pin := rpio.Pin(i)
			pin.Write(rpio.Low)
		}
		//获取oid对应的Map
		P, Gid = Oid2Pin(Oid)
		// 如果传入了闪烁时间并且大于20毫秒，则闪烁
		if Flashtime > 20 {
			go Flashs(Gid, Waittime, Flashtime, P) //开启闪烁协程
			//time.Sleep(time.Duration(Waittime) * time.Millisecond) //等待闪烁结束
			Msg.Code = "success"
			Msg.Info = fmt.Sprintf("%v;", Msg.Info) + fmt.Sprintf("%d", Oid) + "号LED已打开并闪烁" + fmt.Sprintf("%d", Waittime) + "毫秒"
			beego.Info(Msg.Info)
		} else {
			// 如果传入了等待时间，则在等待时间后关闭LED
			go Opens(Gid, Waittime, P)
			//beego.Info("协程调用结束")
			Msg.Code = "success"
			Msg.Info = fmt.Sprintf("%v;", Msg.Info) + fmt.Sprintf("%d", Oid) + "号LED已打开并常亮" + fmt.Sprintf("%d", Waittime) + "毫秒"
			beego.Info(Msg.Info)
		}
		c.Ctx.Output.SetStatus(200)
	} else {
		//Gid为0表示数字不在1-98这个范围，直接返回错误
		Msg.Code = "error"
		Msg.Info = fmt.Sprintf("%v;", Msg.Info) + "oid不是1-98的整数数字"
		beego.Error("oid不是1-98的整数数字")
		c.Ctx.Output.SetStatus(400)
	}

	//如果采用JSONP方式跨域，则使用下面返回
	c.Data["jsonp"] = &Msg
	c.ServeJSONP()
	//如果采用CORS方式跨域，则使用如下返回
	//c.Data["json"] = &Msg
	//c.ServeJSON()
}

//Flashs 闪烁LED的开启控制
//使用管道实现协程退出控制
func Flashs(Gid, Waittime, Flashtime int64, P map[int]string) error {
	startTime := time.Now() // 开始时间
	endTime := time.Duration(Waittime) * time.Millisecond //总亮灯时长
	fTime :=  time.Duration(Flashtime) * time.Millisecond //闪烁间隔时长
	//T := int(Flashtime)
	//Tx2 := 2 * Flashtime //2倍闪亮时间
	//var i int64
	//for i = 0; i < Waittime; i += Tx2 {
	for {
		OpenLEDs(P)
		Status = true
		//j := i //控制循环内部时长,避免延迟关闭
		//for t := 0; t < T && j < Waittime; t++ {
		for st := time.Now(); time.Since(st) < fTime; {
			select {
			case <-Ch:
				ClosedLEDs(P)
				Status = false
				f := fmt.Sprintf("关闭第%d组协程", Gid)
				err := errors.New(f)
				beego.Info(err)
				return err
			default:
				runTime := time.Since(startTime) //获取函数已经执行的时长
				if runTime > endTime {
					Status = false
					return nil
				}
				//time.Sleep(1 * time.Millisecond)
				//j++
			}
		}
		ClosedLEDs(P)
		//for t := 0; t < T && j < Waittime; t++ {
		for st := time.Now(); time.Since(st) < fTime; {
			select {
			case <-Ch:
				f := fmt.Sprintf("关闭第%d组协程", Gid)
				err := errors.New(f)
				beego.Info(err)
				Status = false
				return err
			default:
				runTime := time.Since(startTime) //获取函数已经执行的时长
				if runTime > endTime {
					Status = false
					return nil
				}
}

//Opens 无闪烁LED的开启控制
//使用管道实现协程退出控制
func Opens(Gid, Waittime int64, P map[int]string) error {
	OpenLEDs(P)
	startTime := time.Now() // get current time
	endTime := time.Duration(Waittime) * time.Millisecond
	Status = true
	for {
		select {
		case <-Ch:
			ClosedLEDs(P)
			Status = false
			f := fmt.Sprintf("第%d组协程被中断", Gid)
			err := errors.New(f)
			beego.Error(err)
			return err
		default:
			runTime := time.Since(startTime) //获取函数已经执行的时长
			if runTime > endTime {
				ClosedLEDs(P)
				Status = false
				return nil
			}
		}
	}
}
