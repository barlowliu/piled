package controllers

import (
	"github.com/astaxie/beego"
)

type MainController struct {
	beego.Controller
}

func (c *MainController) Get() {
	Msg := &Msg{
		Code: "success",
		Info: "欢迎访问树莓派LED管理系统",
	}

	c.Data["json"] = &Msg
	c.ServeJSON()
}
