/*
实现将传入的led灯序号转换为对应的二进制编码
*/
package controllers

import (
    "fmt"
    "github.com/astaxie/beego"
)

//Oid2Pin() 传入Oid，转换为对应的灯编码map输出
//第一组引脚：14 15 18 23
//第二组引脚：24 25 8 7
//第三组引脚：1 12 16 20
//第四组引脚：2 3 4 17
//第五组引脚：27 22 10 9
//第六组引脚：11 0 5 6
//第七组引脚：13 19 26 21
func Oid2Pin(id int64) (map[int]string, int64) {
    var P map[int]string
    var gid int64 = 0 //组编号，用于后继并发控制
    //传入的数字必须是0-98之间的正整数
    if id > 98 || id <= 0 {
        //err := errors.New("传入的数字不是1-98之间的正整数")
        return P,gid
    }
    //err := errors.New("")
    //第一组灯
    if id > 0 && id <= 14 {
        gid = 1
        //0号灯用于关闭而非点亮，因此跳过
        //14号出口异常，跳过直接点亮15号灯
        if id == 14 {
            id = id + 1
        }
        //转换二进制
        oid2 := fmt.Sprintf("%04b", id)
        beego.Info(oid2)
        P = map[int]string{
            23: oid2[0:1],
            18: oid2[1:2],
            15: oid2[2:3],
            14: oid2[3:4],
        }
        return P,gid
    }
    //第二组灯
    if id > 14 && id <= 28 {
        gid = 2
        id = id - 14
        //14号出口异常，跳过直接点亮15号灯
        if id == 14 {
            id = id + 1
        }
        //转换二进制
        oid2 := fmt.Sprintf("%04b", id)
        beego.Info(oid2)
        P = map[int]string{
            7:  oid2[0:1],
            8:  oid2[1:2],
            25: oid2[2:3],
            24: oid2[3:4],
        }
        return P,gid
    }

    if id > 28 && id <= 42 {
        //第三组灯
        gid = 3
        id = id - 28
        //14号出口异常，跳过直接点亮15号灯
        if id == 14 {
            id = id + 1
        }
        //转换二进制
        oid2 := fmt.Sprintf("%04b", id)
        beego.Info(oid2)
        P = map[int]string{
            20: oid2[0:1],
            16: oid2[1:2],
            12: oid2[2:3],
            1:  oid2[3:4],
        }
        return P,gid
    }
    if id > 42 && id <= 56 {
        //第四组灯
        gid = 4
        id = id - 42
        //14号出口异常，跳过直接点亮15号灯
        if id == 14 {
            id = id + 1
        }
        //转换二进制
        oid2 := fmt.Sprintf("%04b", id)
        beego.Info(oid2)
        P = map[int]string{
            17: oid2[0:1],
            4:  oid2[1:2],
            3:  oid2[2:3],
            2:  oid2[3:4],
        }
        return P,gid
    }
    if id > 56 && id <= 70 {
        //第五组灯
        gid = 5
        id = id - 56
        //14号出口异常，跳过直接点亮15号灯
        if id == 14 {
            id = id + 1
        }
        //转换二进制
        oid2 := fmt.Sprintf("%04b", id)
        beego.Info(oid2)
        P = map[int]string{
            9:   oid2[0:1],
            10:  oid2[1:2],
            22:  oid2[2:3],
            27:  oid2[3:4],
        }
        return P,gid
    }
    if id > 70 && id <= 84 {
        //第六组灯
        gid = 6
        id = id - 70
        //14号出口异常，跳过直接点亮15号灯
        if id == 14 {
            id = id + 1
        }
        //转换二进制
        oid2 := fmt.Sprintf("%04b", id)
        beego.Info(oid2)
        P = map[int]string{
            6:  oid2[0:1],
            5:  oid2[1:2],
            0:  oid2[2:3],
            11: oid2[3:4],
        }
        return P,gid
    }
    if id > 84 && id <= 98 {
        //第七组灯
        gid = 7
        id = id - 84
        //14号出口异常，跳过直接点亮15号灯
        if id == 14 {
            id = id + 1
        }
        //转换二进制
        oid2 := fmt.Sprintf("%04b", id)
        beego.Info(oid2)
        P = map[int]string{
            21: oid2[0:1],
            26: oid2[1:2],
            19: oid2[2:3],
            13: oid2[3:4],
        }
    }
    return P,gid
}

