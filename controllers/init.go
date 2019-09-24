package controllers

import (
	"github.com/astaxie/beego"
	"github.com/stianeikeland/go-rpio"
	"os"
	"time"
)

//Init() 初始化将所有接口置为低电平,然后依次点亮各LED
func Init() {
	err := rpio.Open()
	if err != nil {
		beego.Error(err)
		os.Exit(1)
	}
	//defer rpio.Close()
	//关闭所有GPIO接口，并置为输出模式
	for i := 0; i < 29; i++ {
		pin := rpio.Pin(i)
		pin.Mode(rpio.Output)
		pin.Write(rpio.Low)
	}
	//依次点亮所有led指示灯，量100毫秒
	var I int64
	for I = 1; I < 99; I++ {
		P,_ := Oid2Pin(I)
		TestOpenLED(100, P)
	}
}

//TestOpenLED 不闪烁开启一段时间LED后关闭
func TestOpenLED(Waittime int64, P map[int]string) string{
	OpenLEDs(P)
	time.Sleep(time.Duration(Waittime) * time.Millisecond)
	ClosedLEDs(P)
	return "测试LED成功"
}