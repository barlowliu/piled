/*
获取树莓派wifi地址，实现注册到服务器
*/
package controllers

import (
	"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/httplib"
	"net"
	"time"
)

type NetController struct {
	beego.Controller
}

type Reginfo struct {
	Code   string `json:code`
	MAC    string `json:"mac"`
	IP     string `json:"ip"`
	TypeId string `json:"typeid"`
}

func (c *NetController) Get() {
	macAddrs := GetMacAddrs()
	fmt.Printf("mac addrs: %q\n", macAddrs[1])
	ips := GetIPs()
	fmt.Printf("ips: %q\n", ips[1])
	Msg := &Reginfo{
		Code:   "success",
		MAC:    macAddrs[1],
		IP:     ips[1],
		TypeId: beego.AppConfig.String("type_id"),
	}
	c.Data["json"] = &Msg
	c.ServeJSON()
}

//GetMacAddrs() 获取MAC地址
func GetMacAddrs() (macAddrs []string) {
	netInterfaces, err := net.Interfaces()
	if err != nil {
		fmt.Printf("获取接口地址错误: %v", err)
		return macAddrs
	}

	for _, netInterface := range netInterfaces {
		macAddr := netInterface.HardwareAddr.String()
		if len(macAddr) == 0 {
			continue
		}

		macAddrs = append(macAddrs, macAddr)
	}
	return macAddrs
}

// GetIPs() 获取IP地址
func GetIPs() (ips []string) {
	interfaceAddr, err := net.InterfaceAddrs()
	if err != nil {
		fmt.Printf("获取接口地址错误: %v", err)
		return ips
	}

	for _, address := range interfaceAddr {
		ipNet, isValidIpNet := address.(*net.IPNet)
		if isValidIpNet && !ipNet.IP.IsLoopback() {
			if ipNet.IP.To4() != nil {
				ips = append(ips, ipNet.IP.String())
			}
		}
	}
	return ips
}

//Register 注册到调用服务器
func Register() error {
	macAddrs := GetMacAddrs()
	fmt.Printf("mac addrs: %q\n", macAddrs[len(macAddrs)-1])
	ips := GetIPs()
	fmt.Printf("ips: %q\n", ips[len(ips)-1])
	mac := macAddrs[len(macAddrs)-1]
	ip := ips[len(ips)-1]
	url := "http://" + ip + ":8080/led/"
	wms_url := beego.AppConfig.String("wms_url")
	id := beego.AppConfig.String("id")
	tid := beego.AppConfig.String("type_id")
	//发起请求，定义超时时间
	var req = httplib.Post(wms_url).SetTimeout(30*time.Second, 100*time.Second)
	req.Param("mac", mac)
	req.Param("url", url)
	req.Param("typeid", tid)
	req.Param("id", id) //机器编号
	str, err := req.String()
	beego.Info(str)
	return err
}
