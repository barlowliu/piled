package main

import (
    "fmt"
    "time"
)

func main()  {
    var j int = 10
    var t int = 8
    for i := 0; i < j && t < j ; i ++ {
        time.Sleep( 1 * time.Second)
        t++
        fmt.Printf("第%d循环，t=%d\n", i+1, t)
    }
}
