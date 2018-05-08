import '../../lib/bootstrap-3.3.7-dist/css/bootstrap.min.css'
import './login.less'
window.$ = require('../../lib/jquery-3.3.1.min')
$(($) => {
    let login = () => {
        let username = $("#username").val()
        let password = $("password").val()
        if(!username || !password){
            $("#alert").show(500);
            $("#alert-s2").html("username and password connot be null.");
        }
        $.post("/login", {
            username: $("#username").val(),
            password: $("#password").val()
        }, (res) => {
            switch (res.toString()) {
                case "-2":
                case "-1":
                    $("#alert").show(500);
                    $("#alert-s2").html("Mismatched username and password.Check again.");
                    break;
                case "1":
                    $("#alert").removeClass("alert-warning").addClass("alert-success").show(500);
                    $("#alert-s2").html("欢迎 " + $("#username").val() + "登陆☺");
                    $("#alert-s1").addClass("glyphicon glyphicon-ok").attr("color", "green").html("");
                    setTimeout(() => {
                        window.location.href = "/management";
                    }, 1000);
                    break;
                default:
                    $("#alert").show(500);
                    $("#alert-s2").html("Sorry.Please try again.");
                    break;
            }
        })
    }

    $("#submit").click(() => {
        login();
    })
    $("#password").keyup((e) => {
        if (e && e.keyCode == '13') {
            login();
        }
    })
})