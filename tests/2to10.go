package main

import (
	"fmt"
	//"fmt"
	"github.com/astaxie/beego"
	"github.com/stianeikeland/go-rpio"
	"piled/controllers"
	//"github.com/stianeikeland/go-rpio"
)

func main() {
	err := rpio.Open()
	if err != nil {
		fmt.Println(err)
		return
	}
	P, Gid := controllers.Oid2Pin(28)
	beego.Info(P, Gid)
}
