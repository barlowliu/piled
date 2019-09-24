package main

import (
    "fmt"
    "github.com/stianeikeland/go-rpio"
)

func main()  {
    err := rpio.Open()
    if err != nil {
        fmt.Println(err)
        return
    }

}
