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
	Ch1  = make(chan string, 1)
	Ch2  = make(chan string, 1)
	Ch3  = make(chan string, 1)
	Ch4  = make(chan string, 1)
	Ch5  = make(chan string, 1)
	Ch6  = make(chan string, 1)
	Ch7  = make(chan string, 1)
	Status1 bool = false
	Status2 bool = false
	Status3 bool = false
	Status4 bool = false
	Status5 bool = false
	Status6 bool = false
	Status7 bool = false
)

func (c *LedController) Get() {
	Msg := &Msg{
		Code: "success",
		Info: "打开LED成功",
	}
	//
	var P map[int]string
	var Gid int64
	//获取参数，需传入打开的灯的ID和打开时长
	Waittime, err := strconv.ParseInt(c.Input().Get("waittime"), 10, 64)
	if err != nil {
		beego.Info("未传入等待关闭时间或非数字错误")
	}
	beego.Info("Waittime:" + string(Waittime))

	Flashtime, err := strconv.ParseInt(c.Input().Get("flashtime"), 10, 64)
	if err != nil {
		beego.Info("未传入闪烁时间或非数字错误")
	}
	beego.Info("Flashtime:" + string(Flashtime))
	//从配置文件中获取默认等待时间
	default_waittime, err := strconv.ParseInt(beego.AppConfig.String("default_waittime"), 10, 64)
	if err != nil {
		beego.Error("默认等待时间default_waittime未配置或未非数字")
	}
	//
	Cid, err := strconv.ParseInt(c.Input().Get("cid"), 10, 64)
	if err != nil {
		beego.Info("未传入需要关闭的LED ID或参数错误")
	} else {
		// 如果存在Closeid则执行关闭
		if Cid > 0 && Cid <= 98 {
			//先获取cid对应的针脚id
			P,Gid = Oid2Pin(Cid)
			beego.Info(Gid)
			res := ClosedLEDs(P)
			beego.Info(res)
			Msg.Code = "success"
			Msg.Info = "关闭" + fmt.Sprintf("%d", Cid) + "号LED成功"
			c.Ctx.Output.SetStatus(200)
		}
	}

	Oid, err1 := strconv.ParseInt(c.Input().Get("oid"), 10, 64)
	if err1 != nil {
		if err != nil {
			Msg.Code = "error"
			Msg.Info = "oid和cid值都非法或都不存在，将不进行任何操作"
			c.Ctx.Output.SetStatus(400)
		} else {
			beego.Info("oid值非法或不存在")
		}
	} else if Oid > 0 && Oid <= 98 {
		//获取oid对应的Map
		P,Gid = Oid2Pin(Oid)
		beego.Info(Gid)
		beego.Info(P)
		//beego.Info(Flashtime)
		//beego.Info(Waittime)
		//写协程管道，实现终止还未关闭的协程
		switch Gid {
		case 1:
			Ch1 <- "true"
		case 2:
			Ch2 <- "true"
		case 3:
			Ch3 <- "true"
		case 4:
			Ch4 <- "true"
		case 5:
			Ch5 <- "true"
		case 6:
			Ch6 <- "true"
		case 7:
			Ch7 <- "true"
		}
		//等待一会再开始协程事务，避免新开协程抢占此前发送的协程信号
		time.Sleep(5 * time.Millisecond)
		// 如果传入了闪烁时间，则在持续闪烁
		if Flashtime > 0 {
			if Waittime > 0 {
				beego.Info("开始协程事务")
				go FlashGroups(Gid, Waittime, Flashtime, P)
				beego.Info("协程调用结束")
				//beego.Info(res)
				Msg.Code = "success"
				Msg.Info = fmt.Sprintf("%d", Oid) + "号LED已打开并闪烁" + fmt.Sprintf("%d", Waittime) + "毫秒"
			} else {
				//go FlashLEDs(P, Flashtime, default_waittime)
				beego.Info("开始协程事务")
				go FlashGroups(Gid, default_waittime, Flashtime, P)
				beego.Info("协程调用结束")
				//beego.Info(res)
				Msg.Code = "success"
				Msg.Info = fmt.Sprintf("%d", Oid) + "号LED已打开并闪烁" + fmt.Sprintf("%d", default_waittime) + "毫秒"
			}
		} else {
			// 如果传入了等待时间，则在等待时间后关闭LED
			if Waittime > 0 {
				beego.Info("开始协程事务")
				go OpenGroups(Gid, Waittime, P)
				beego.Info("协程调用结束")
				Msg.Code = "success"
				Msg.Info = fmt.Sprintf("%d", Oid) + "号LED已打开" + fmt.Sprintf("%d", Waittime) + "毫秒"
			} else {
				beego.Info("开始协程事务")
				go OpenGroups(Gid, default_waittime, P)
				beego.Info("协程调用结束")
				Msg.Code = "success"
				Msg.Info = fmt.Sprintf("%d", Oid) + "号LED已打开" + fmt.Sprintf("%d", default_waittime) + "毫秒"
			}
		}
		c.Ctx.Output.SetStatus(200)
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
	var Status bool
	switch Gid {
	case 1:
		Status = Status1
	case 2:
		Status = Status2
	case 3:
		Status = Status3
	case 4:
		Status = Status4
	case 5:
		Status = Status5
	case 6:
		Status = Status6
	case 7:
		Status = Status7
	}
	for {
		select {
		case <-Ch1:
			if Status == true {
				//ClosedLEDs(P)
				beego.Info("其他LED开启，退出1号协程")
				Status1 = Status
				return nil
			}
			Status = true
			Status1 = Status
		case <-Ch2:
			if Status == true {
				//ClosedLEDs(P)
				beego.Info("其他LED开启，退出2号协程")
				Status2 = Status
				return nil
			}
			Status = true
			Status2 = Status
		case <-Ch3:
			if Status == true {
				//ClosedLEDs(P)
				beego.Info("其他LED开启，退出3号协程")
				Status3 = Status
				return nil
			}
			Status = true
			Status3 = Status
		case <-Ch4:
			if Status == true {
				//ClosedLEDs(P)
				beego.Info("其他LED开启，退出4号协程")
				Status4 = Status
				return nil
			}
			Status = true
			Status4 = Status
		case <-Ch5:
			if Status == true {
				//ClosedLEDs(P)
				beego.Info("其他LED开启，退出5号协程")
				Status5 = Status
				return nil
			}
			Status = true
			Status5 = Status
		case <-Ch6:
			if Status == true {
				//ClosedLEDs(P)
				beego.Info("其他LED开启，退出6号协程")
				Status6 = Status
				return nil
			}
			Status = true
			Status6 = Status
		case <-Ch7:
			if Status == true {
				//ClosedLEDs(P)
				beego.Info("其他LED开启，退出7号协程")
				Status7 = Status
				return nil
			}
			Status = true
			Status7 = Status
		default:
			if Status == true {
				T += 1
				//beego.Info(T, Waittime)
				if T >= Waittime {
					ClosedLEDs(P)
					//<- stop
					Status = false
					switch Gid {
					case 1:
						Status1 = Status
					case 2:
						Status2 = Status
					case 3:
						Status3 = Status
					case 4:
						Status4 = Status
					case 5:
						Status5 = Status
					case 6:
						Status6 = Status
					case 7:
						Status7 = Status
					}
					return nil
				}
				time.Sleep(1 * time.Millisecond)
			}
			//status = true
		}
	}
}

//FlashGroups 闪烁LED的开启控制
//使用管道实现协程退出控制
func  FlashGroups(Gid, Waittime, Flashtime int64, P map[int]string)  error {
	var Status bool
	switch Gid {
	case 1:
		Status = Status1
	case 2:
		Status = Status2
	case 3:
		Status = Status3
	case 4:
		Status = Status4
	case 5:
		Status = Status5
	case 6:
		Status = Status6
	case 7:
		Status = Status7
	}
	T := int(Flashtime)
	T2 := 2 * Flashtime //2倍闪亮时间
	var i int64
	for i = 0; i < Waittime; i += T2 {
		OpenLEDs(P)
		for t := 0 ; t < T; t++ {
			select {
			case <-Ch1:
				if Status == true {
					//ClosedLEDs(P)
					beego.Info("其他LED开启，退出1号协程")
					Status1 = Status
					return nil
				}
				Status = true
				Status1 = Status
			case <-Ch2:
				if Status == true {
					//ClosedLEDs(P)
					beego.Info("其他LED开启，退出2号协程")
					Status2 = Status
					return nil
				}
				Status = true
				Status2 = Status
			case <-Ch3:
				if Status == true {
					//ClosedLEDs(P)
					beego.Info("其他LED开启，退出3号协程")
					Status3 = Status
					return nil
				}
				Status = true
				Status3 = Status
			case <-Ch4:
				if Status == true {
					//ClosedLEDs(P)
					beego.Info("其他LED开启，退出4号协程")
					Status4 = Status
					return nil
				}
				Status = true
				Status4 = Status
			case <-Ch5:
				if Status == true {
					//ClosedLEDs(P)
					beego.Info("其他LED开启，退出5号协程")
					Status5 = Status
					return nil
				}
				Status = true
				Status5 = Status
			case <-Ch6:
				if Status == true {
					//ClosedLEDs(P)
					beego.Info("其他LED开启，退出6号协程")
					Status6 = Status
					return nil
				}
				Status = true
				Status6 = Status
			case <-Ch7:
				if Status == true {
					//ClosedLEDs(P)
					beego.Info("其他LED开启，退出7号协程")
					Status7 = Status
					return nil
				}
				Status = true
				Status7 = Status
			default:
				if Status == true {
					//T += 1
					time.Sleep(1 * time.Millisecond)
				}
			}
		}
		ClosedLEDs(P)
		T = int(Flashtime)
		for t := 0 ; t < T; t++ {
			select {
			case <-Ch1:
				if Status == true {
					beego.Info("其他LED开启，退出1号协程")
					Status1 = Status
					return nil
				}
				Status = true
				Status1 = Status
			case <-Ch2:
				if Status == true {
					beego.Info("其他LED开启，退出2号协程")
					Status2 = Status
					return nil
				}
				Status = true
				Status2 = Status
			case <-Ch3:
				if Status == true {
					beego.Info("其他LED开启，退出3号协程")
					Status3 = Status
					return nil
				}
				Status = true
				Status3 = Status
			case <-Ch4:
				if Status == true {
					beego.Info("其他LED开启，退出4号协程")
					Status4 = Status
					return nil
				}
				Status = true
				Status4 = Status
			case <-Ch5:
				if Status == true {
					beego.Info("其他LED开启，退出5号协程")
					Status5 = Status
					return nil
				}
				Status = true
				Status5 = Status
			case <-Ch6:
				if Status == true {
					beego.Info("其他LED开启，退出6号协程")
					Status6 = Status
					return nil
				}
				Status = true
				Status6 = Status
			case <-Ch7:
				if Status == true {
					beego.Info("其他LED开启，退出7号协程")
					Status7 = Status
					return nil
				}
				Status = true
				Status5 = Status
			default:
				if Status == true {
					//T += 1
					time.Sleep(1 * time.Millisecond)
				}
			}
		}
	}
	Status = false
	switch Gid {
	case 1:
		Status1 = Status
	case 2:
		Status2 = Status
	case 3:
		Status3 = Status
	case 4:
		Status4 = Status
	case 5:
		Status5 = Status
	case 6:
		Status6 = Status
	case 7:
		Status7 = Status
	}
	return  nil
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