package main

import (
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/plugins/cors"

	"piled/controllers"
	_ "piled/routers"
)

func main() {
	beego.SetLogger("file", `{"filename":"logs/piled.log"}`)
	beego.BeeLogger.DelLogger("console") //不在控制台显示日志
	// 初始化树莓派
	controllers.Init()
	// 注册到调用服务器
	err := controllers.Register()
	if err != nil {
		go func() {
			beego.Error("注册失败，10秒后重新尝试注册")
			time.Sleep(10000 * time.Millisecond)
			err1 := controllers.Register()
			beego.Info(err1)
		}()
	}
	//允许跨域调用
	beego.InsertFilter("*", beego.BeforeRouter, cors.Allow(&cors.Options{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Content-Type"},
		AllowCredentials: true,
	}))
	beego.Run()
}
