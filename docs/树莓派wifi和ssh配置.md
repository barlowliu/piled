# 树莓派连接wifi配置并启用ssh
<!--toc-->
下面所有配置都是针对官方系统，非第三方改版系统，有些第三方发行版可能会修改自动处理机制。
官方系统默认会读取/boot下的wpa_supplicant.conf来启动wifi配置。而/boot是能在windows识别的，因此就可以很方便我们进行基本配置。
## wifi配置
将下列内容保存为wpa_supplicant.conf，然后将树莓派sd卡插入电脑，将这个文件拷贝到能识别的那个目录下。
```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=CN

network={
	ssid="WW"
	psk="12345678"
	key_mgmt=WPA-PSK
}
```
PS：注意文件编码格式，必须为utf-8编码，LF换行，建议使用notepad++编辑。

## 启用ssh
同上，在Windows上插入SD卡后，能识别的目录下创建名为ssh的文件，无需写入任何内容，只需创建空文件即可。切记文件没有后缀。

做完上述两步配置后，SD卡插入树莓派启动后就能自动连接wifi，并启用ssh。通过查看无线路由器中分配的给树莓派的IP就可以远程管理了。