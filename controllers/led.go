/*
  7组灯，每组14个灯（每一组的0号和14号灯都无法使用）,共计98个灯
  同一组同时只能有一个被点亮
  但不同的组，可以可以同时各自点亮一个
  直接使用Get请求实现led灯的点亮
  Get请求参数如下：
	oid：要打开的灯序号，从1-98
    cid：要关闭的灯序号，从1-98
    timeout：亮灯超时时间，不传时，默认取配置文件中的值
    flashtime：闪烁间隔，无默认值，不传时不闪烁
*/

package controllers

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/astaxie/beego"
	"github.com/stianeikeland/go-rpio"
)

type LedController struct {
	beego.Controller
}
//返回信息
type Msg struct {
	Code string
	Info interface{}
}

//协程管道控制全局变量
var (
	Ch1  = make(chan string)
	Ch2  = make(chan string)
	Ch3  = make(chan string)
	Ch4  = make(chan string)
	Ch5  = make(chan string)
	Ch6  = make(chan string)
	Ch7  = make(chan string)
	Status1 bool = false
	Status2 bool = false
	Status3 bool = false
	Status4 bool = false
	Status5 bool = false
	Status6 bool = false
	Status7 bool = false
)

//Get
func (c *LedController) Get() {
	Msg := &Msg{
		Code: "success",
		Info: "打开LED成功",
	}
	//灯序号映射为树莓派引脚的map
	var (
		P map[int]string
	    Gid int64
		Waittime int64
		Flashtime int64
		err error
	)
	//获取参数，需传入打开的灯的ID和打开时长
	Waittime, err = strconv.ParseInt(c.Input().Get("waittime"), 10, 64)
	if err != nil {
		beego.Info("未传入等待关闭时间或非数字错误")
		//如果未参入等待时长，则从配置文件中获取默认等待时间
		Waittime, err = strconv.ParseInt(beego.AppConfig.String("default_waittime"), 10, 64)
		if err != nil {
			beego.Error("默认等待时间default_waittime未配置或未非数字")
		}
	}
	beego.Info("Waittime:" + strconv.FormatInt(Waittime,10))

	Flashtime, err = strconv.ParseInt(c.Input().Get("flashtime"), 10, 64)
	if err != nil {
		beego.Info("未传入闪烁时间或非数字错误")
	}
	beego.Info("Flashtime:" + strconv.FormatInt(Flashtime,10))

	Cid, err := strconv.ParseInt(c.Input().Get("cid"), 10, 64)
	if err != nil {
		beego.Info("未传入需要关闭的LED ID或参数错误")
	} else {
		// 如果存在Closeid则执行关闭
		if Cid > 0 && Cid <= 98 {
			//先获取cid对应的针脚id映射
			P,Gid = Oid2Pin(Cid)
			//beego.Info(Gid)
			//写协程管道，实现终止还未关闭的协程
			switch Gid {
			case 1:
				//如果有同组协程未退出，则通知退出
				if Status1 == true {
					Ch1 <- "stop"
					beego.Info("停止第一组协程")
				}
			case 2:
				if Status2 == true {
					Ch2 <- "stop"
					beego.Info("停止第二组协程")
				}
			case 3:
				if Status3 == true {
					Ch3 <- "stop"
					beego.Info("停止第三组协程")
				}
			case 4:
				if Status4 == true {
					Ch4 <- "stop"
					beego.Info("停止第四组协程")
				}
			case 5:
				if Status5 == true {
					Ch5 <- "stop"
					beego.Info("停止第五组协程")
				}
			case 6:
				if Status6 == true {
					Ch6 <- "stop"
					beego.Info("停止第六组协程")
				}
			case 7:
				if Status7 == true {
					Ch7 <- "stop"
					beego.Info("停止第七组协程")
				}
			}
			res := ClosedLEDs(P)
			beego.Info(res)
			Msg.Code = "success"
			Msg.Info = "关闭" + fmt.Sprintf("%d", Cid) + "号LED成功"
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
			Msg.Info = "oid和cid值都非法或都不存在，将不进行任何操作"
			beego.Error("oid和cid值都非法或都不存在，将不进行任何操作")
			c.Ctx.Output.SetStatus(400)
		}
		//此种情况说明仅传入了cid，因此直接返回前面关闭是否成功消息
		beego.Error("oid值非法或不存在，但存在Cid")
	} else 	if Oid > 0 && Oid <= 98 {
		//获取oid对应的Map
		P,Gid = Oid2Pin(Oid)
		beego.Info(Gid)
		beego.Info(P)
		fmt.Println("读取GPIO状态")
		ReadPinStatus(P)
		//beego.Info(Flashtime)
		//beego.Info(Waittime)
		//写协程管道，实现终止还未关闭的协程
		switch Gid {
		case 1:
			//如果有同组协程未退出，则通知退出
			if Status1 == true {
				Ch1 <- "stop"
				beego.Info("停止第一组协程")
			}
		case 2:
			if Status2 == true {
				Ch2 <- "stop"
				beego.Info("停止第二组协程")
			}
		case 3:
			if Status3 == true {
				Ch3 <- "stop"
				beego.Info("停止第三组协程")
			}
		case 4:
			if Status4 == true {
				Ch4 <- "stop"
				beego.Info("停止第四组协程")
			}
		case 5:
			if Status5 == true {
				Ch5 <- "stop"
				beego.Info("停止第五组协程")
			}
		case 6:
			if Status6 == true {
				Ch6 <- "stop"
				beego.Info("停止第六组协程")
			}
		case 7:
			if Status7 == true {
				Ch7 <- "stop"
				beego.Info("停止第七组协程")
			}
		}
		//等待一会再开始协程事务，避免新开协程抢占此前发送的协程信号
		time.Sleep(3 * time.Millisecond)
		// 如果传入了闪烁时间，则在持续闪烁
		if Flashtime > 0 {
			beego.Info("开始协程事务")
			go FlashGroups(Gid, Waittime, Flashtime, P)
			//beego.Info("协程调用结束")
			//beego.Info(res)
			Msg.Code = "success"
			Msg.Info = fmt.Sprintf("%d", Oid) + "号LED已打开并将闪烁" + fmt.Sprintf("%d", Waittime) + "毫秒"
		} else {
			// 如果传入了等待时间，则在等待时间后关闭LED
			beego.Info("开始第",Gid ,"组协程事务")
			go OpenGroups(Gid, Waittime, P)
			//beego.Info("协程调用结束")
			Msg.Code = "success"
			Msg.Info = fmt.Sprintf("%d", Oid) + "号LED已打开并将常亮" + fmt.Sprintf("%d", Waittime) + "毫秒"
		}
		c.Ctx.Output.SetStatus(200)
	} else {
		//Gid为0表示数字不在1-98这个范围，直接返回错误
		Msg.Code = "error"
		Msg.Info = "oid不是1-98的整数数字"
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

//OpenGroups 无闪烁LED的开启控制
//使用管道实现协程退出控制
func  OpenGroups(Gid, Waittime int64, P map[int]string)  error {
	OpenLEDs(P)
	var T int64 = 0
	for {
		select {
		case <-Ch1:
			if Status1 == true {
				ClosedLEDs(P)
				beego.Info("本组其他LED开启，退出1号协程")
				Status1 = false
				return nil
			}
			Status1 = true
		case <-Ch2:
			if Status2 == true {
				ClosedLEDs(P)
				beego.Info("本组其他LED开启，退出2号协程")
				Status2 = false
				return nil
			}
			Status2 = true
		case <-Ch3:
			if Status3 == true {
				ClosedLEDs(P)
				beego.Info("本组其他LED开启，退出3号协程")
				Status3 = false
				return nil
			}
			Status3 = true
		case <-Ch4:
			if Status4 == true {
				ClosedLEDs(P)
				beego.Info("本组其他LED开启，退出4号协程")
				Status4 = false
				return nil
			}
			Status4 = true
		case <-Ch5:
			if Status5 == true {
				ClosedLEDs(P)
				beego.Info("本组其他LED开启，退出5号协程")
				Status5 = false
				return nil
			}
			Status5 = true
		case <-Ch6:
			if Status6 == true {
				ClosedLEDs(P)
				beego.Info("本组其他LED开启，退出6号协程")
				Status6 = false
				return nil
			}
			Status6 = true
		case <-Ch7:
			if Status7 == true {
				ClosedLEDs(P)
				beego.Info("本组其他LED开启，退出7号协程")
				Status7 = false
				return nil
			}
			Status7 = true
		default:
			//通道为接收到关闭信号时，执行的处理，实现计时，到waittime后退出
			f := fmt.Sprintf("第%d组第%b 号灯点亮时长%d 毫秒后正常关闭",Gid, &P, T)
			err := errors.New(f)
			switch Gid {
			case 1:
				if T >= Waittime {
					ClosedLEDs(P)
					Status1 = false
					fmt.Println(err)
					return err
				}
				Status1 = true
			case 2:
				if T >= Waittime {
					ClosedLEDs(P)
					Status2 = false
					fmt.Println(err)
					return err
				}
				Status2 = true
			case 3:
				if T >= Waittime {
					ClosedLEDs(P)
					Status3 = false
					fmt.Println(err)
					return err
				}
				Status3 = true
			case 4:
				if T >= Waittime {
					ClosedLEDs(P)
					Status4 = false
					fmt.Println(err)
					return err
				}
				Status4 = true
			case 5:
				if T >= Waittime {
					ClosedLEDs(P)
					Status5 = false
					fmt.Println(err)
					return err
				}
				Status5 = true
			case 6:
				if T >= Waittime {
					ClosedLEDs(P)
					Status6 = false
					fmt.Println(err)
					return err
				}
				Status6 = true
			case 7:
				if T >= Waittime {
					ClosedLEDs(P)
					Status7 = false
					fmt.Println(err)
					return err
				}
				Status7 = true
			}
			time.Sleep(1 * time.Millisecond)
			T += 1
		}
	}
}

//FlashGroups 闪烁LED的开启控制
//使用管道实现协程退出控制
func  FlashGroups(Gid, Waittime, Flashtime int64, P map[int]string)  error {
	T := int(Flashtime)
	Tx2 := 2 * Flashtime //2倍闪亮时间
	var i int64
	for i = 0; i < Waittime; i += Tx2 {
		OpenLEDs(P)
		for t := 0 ; t < T; t++ {
			select {
			case <-Ch1:
				if Status1 == true {
					ClosedLEDs(P)
					beego.Info("本组其他LED开启，退出1号协程")
					Status1 = false
					return nil
				}
				Status1 = true
			case <-Ch2:
				if Status2 == true {
					ClosedLEDs(P)
					beego.Info("本组其他LED开启，退出2号协程")
					Status2 = false
					return nil
				}
				Status2 = true
			case <-Ch3:
				if Status3 == true {
					ClosedLEDs(P)
					beego.Info("本组其他LED开启，退出3号协程")
					Status3 = false
					return nil
				}
				Status3 = true
			case <-Ch4:
				if Status4 == true {
					ClosedLEDs(P)
					beego.Info("本组其他LED开启，退出4号协程")
					Status4 = false
					return nil
				}
				Status4 = true
			case <-Ch5:
				if Status5 == true {
					ClosedLEDs(P)
					beego.Info("本组其他LED开启，退出5号协程")
					Status5 = false
					return nil
				}
				Status5 = true
			case <-Ch6:
				if Status6 == true {
					ClosedLEDs(P)
					beego.Info("本组其他LED开启，退出6号协程")
					Status6 = false
					return nil
				}
				Status6 = true
			case <-Ch7:
				if Status7 == true {
					ClosedLEDs(P)
					beego.Info("本组其他LED开启，退出7号协程")
					Status7 = false
					return nil
				}
				Status7 = true
			default:
				//进入循环即设置状态为true
				switch Gid {
				case 1:
					Status1 = true
				case 2:
					Status2 = true
				case 3:
					Status3 = true
				case 4:
					Status4 = true
				case 5:
					Status5 = true
				case 6:
					Status6 = true
				case 7:
					Status7 = true
				}
				time.Sleep(1 * time.Millisecond)
			}
		}
		ClosedLEDs(P)
		for t := 0 ; t < T; t++ {
			select {
			case <-Ch1:
				beego.Info("本组其他LED开启，退出1号协程")
				Status1 = false
				return nil
			case <-Ch2:
				beego.Info("本组其他LED开启，退出2号协程")
				Status2 = false
				return nil
			case <-Ch3:
				beego.Info("本组其他LED开启，退出3号协程")
				Status3 = false
				return nil
			case <-Ch4:
				beego.Info("本组其他LED开启，退出4号协程")
				Status4 = false
				return nil
			case <-Ch5:
				beego.Info("本组其他LED开启，退出5号协程")
				Status5 = false
				return nil
			case <-Ch6:
				beego.Info("本组其他LED开启，退出6号协程")
				Status6 = false
				return nil
			case <-Ch7:
				beego.Info("本组其他LED开启，退出7号协程")
				Status7 = false
				return nil
			default:
				time.Sleep(1 * time.Millisecond)
			}
		}
	}
	ClosedLEDs(P)
	switch Gid {
	case 1:
		Status1 = false
	case 2:
		Status2 = false
	case 3:
		Status3 = false
	case 4:
		Status4 = false
	case 5:
		Status5 = false
	case 6:
		Status6 = false
	case 7:
		Status7 = false
	}
	f := fmt.Sprintf("第%d组第%d 号灯闪烁时长%d 毫秒后正常关闭",Gid, P, Waittime)
	err := errors.New(f)
	fmt.Println(err)
	return  err
}

// OpenLED() 打开LED
func OpenLEDs(P map[int]string) string {
	for k, v := range P {
		pin := rpio.Pin(k)
		if v == "1" {
			pin.Mode(rpio.Output)
			pin.Write(rpio.High)
		} else {
			pin.Mode(rpio.Output)
			pin.Write(rpio.Low)
		}
	}
	return "打开成功"
}

// ClosedLEDs() 关闭LED
func ClosedLEDs(P map[int]string) string {
	for k, _ := range P {
		pin := rpio.Pin(k)
		pin.Write(rpio.Low)
	}
	return "关闭成功"
}

//ReadPinStatus() 读取引脚状态
func ReadPinStatus(P map[int]string)  {
	for k, _ := range P {
		pin := rpio.Pin(k)
		fmt.Println(pin.Read())
	}
}