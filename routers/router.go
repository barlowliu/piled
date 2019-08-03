package routers

import (
	"github.com/astaxie/beego"
	"piled2/controllers"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/led", &controllers.LedController{})
	beego.Router("/net", &controllers.NetController{})
}
