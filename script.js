var selected=0
var arr=[]
var cen=[]
const electron = require('electron')

// const globalShortcut = electron.globalShortcut;

// Module to control application life.
$(document).ready(function(){


    electron.ipcRenderer.on('data_from_py',(event,list)=> {
        
        console.log(list)

        $(".scrollmenu" ).empty()

        for (var i = 0; i < list.length; i++) {
            $(".scrollmenu" ).append( "<a>"+list[i]+"</a>" );
        }

        var mid= Math.ceil(list.length / 2);
        selected=mid;
        arr= $('.scrollmenu').children();
        
        sum=0;
        for (var i=0;i<arr.length;i++){
            cen.push( sum+$(arr[i]).width()/2 +14 );
            sum+=28+$(arr[i]).width();
            console.log(cen[i]);
        }
        
        $('.scrollmenu').scrollLeft( cen[selected]-200);
        $(arr[selected]).css('background-color' ,'#777');
        $(arr[selected]).attr('id', 'selected');

        
    })
    
    electron.ipcRenderer.on('key', (event, message) => {
      console.log(message) 

        if(message == "Right") {//right
            console.log("right");

            if(selected<arr.length-1){
                $(arr[selected]).css('background-color' ,'white');
                $(arr[selected]).removeAttr('id');
                selected+=1;
                $(arr[selected]).css('background-color' ,'#777');
                $(arr[selected]).attr('id', 'selected');
                $('.scrollmenu').scrollLeft( cen[selected]-200);
            }

        }

        else if(message == "Left") {//left
            console.log("left");

            if(selected>0){
                $(arr[selected]).css('background-color' ,'white');
                $(arr[selected]).removeAttr('id');
                selected-=1;
                $(arr[selected]).css('background-color' ,'#777');
                $(arr[selected]).attr('id', 'selected');
                $('.scrollmenu').scrollLeft( cen[selected]-200);

            }

        }

        else if(message == "Enter") {//left
            console.log("Enter");
            electron.ipcRenderer.send("data_selected",$('#selected').text());
        }

    })


    $('.search_box').hide();
    $('.btn').click(function() {
        $('.search_box').toggle();
        $('.btn').hide();
        $('.scrollmenu').toggle();
    });

    $('.cancel').click(function() {
        $('.search_box').toggle();
        $('.btn').show();
        $('.scrollmenu').toggle();
    });

});

