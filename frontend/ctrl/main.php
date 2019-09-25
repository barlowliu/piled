<?php

class ctrl_main extends L {

    /**
     * 描述：小车控制
     * 作者：Zoro.Zhu
     **/
    public function index(){
        $this->view->headTitle = '树莓派小车';
        $this->display('/html/mainView.html');
    }


}
return true;