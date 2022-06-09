(function() {
    'use strict';
    function waitForKeyElements(t, o, e, i, n) {
        void 0 === e && (e = !0), void 0 === i && (i = 300), void 0 === n && (n = -1);
        var r = "function" == typeof t ? t() : document.querySelectorAll(t),
            u = r && 0 < r.length;
        u && r.forEach(function(t) {
            var e = "data-userscript-alreadyFound";
            t.getAttribute(e) || !1 || (o(t) ? u = !1 : t.setAttribute(e, !0))
        }), 0 === n || u && e || (--n, setTimeout(function() {
            waitForKeyElements(t, o, e, i, n)
        }, i))
    }
    function update_Accesskey() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: "https://gist.githubusercontent.com/Harfho/d4805d8a56793fa59d47e464c6eec243/raw/2cap_api.txt",
            revalidate: false,
            nocache: true,
            onload: (r) => {
                let accesskey = r.responseText
                GM_setValue('2cap_api', JSON.stringify(accesskey));
                console.log(atob(GM_getValue('2cap_api').match(/\w*/gi).filter(e => "" != e)[0]))
            },
            onerror: (r) => {}
        })
    }
    if (GM_getValue('2cap_api', false) == false) {
        update_Accesskey()
    }

    const key =atob(GM_getValue('2cap_api').match(/\w*/gi).filter(e => "" != e)[0])
    const gtipS = ".geetest_tip"
    var title = document.title
    var geetestButton, addButton;
    function SolveCaptcha() {
        0 == GM_getValue("SolveCaptcha", !1) ? GM_setValue("SolveCaptcha", !0) : GM_setValue("SolveCaptcha", !1);
        window.location.reload()
    };
    GM_registerMenuCommand("SolveCaptcha - " + GM_getValue('SolveCaptcha', false), SolveCaptcha, "SolveCaptcha");

    function submit(){
        const in_api= 'http://2captcha.com/in.php';
        const method = 'geetest_v4'
        const pageurl = window.location.href;
        const header_acao = 1;
        let captcha_id ="5b598becae6fa4d1754e0a8511394770"
        GM_xmlhttpRequest({
            method: 'POST',
            url: in_api,
            data: new URLSearchParams({key,method,captcha_id,pageurl,header_acao}).toString(),
            onload: r => {
                let result = r.responseText
                console.log(result);
                document.querySelector(gtipS).innerText=result
                if(/ERROR_NO_SLOT_AVAILABLE/ig.test(result)){
                    try{document.querySelector(gtipS).innerText=result+" Retrying after 10sec or (Click to solve) Button"}catch(e){alert(result)}
                    setTimeout(submit,1000)
                    return
                }
                else if(/ERROR_+/ig.test(result)){
                    try{document.querySelector(gtipS).innerText=result}catch(e){alert(result)}
                    return
                }
                else{
                    GM_setValue("id",parseInt(result.replace(/ok\|/ig,'')))
                    timer(10,result)
                }
            },
            onerror:r =>{console.log(r.response);document.querySelector(gtipS).innerText='Something is Wrong';}
        });
    }

    function getRes(){
        const res_api= 'http://2captcha.com/res.php';
        const action = 'get'
        const id = GM_getValue('id',false);
        const json = 1;
        GM_xmlhttpRequest({
            method: 'POST',
            url: res_api,
            data: new URLSearchParams({key,action,id,json}).toString(),
            onload: r => {
                //console.log(r.response)
                try{
                    var answer = JSON.parse(r.response)
                    GM_setValue('answer',JSON.stringify(answer));
                    console.log(answer.request);
                    var result = answer.request
                    if(/CAPCHA_NOT_READY/ig.test(result)){
                        document.querySelector(gtipS).innerText=result
                        timer(10,result)
                    }else if(/ERROR_+/ig.test(result)){
                        document.querySelector(gtipS).innerText=result
                        return
                    }else{
                        document.getElementById("lot_number").value = result.lot_number;
                        document.getElementById("captcha_output").value = result.captcha_output;
                        document.getElementById("pass_token").value = result.pass_token;
                        document.getElementById("gen_time").value = result.gen_time;
                        document.querySelector(gtipS).innerText='DONE SOLVING CAPTCHA';
                        addButton.innerText ="Captcha Solved"
                        return
                    }
                }catch(e){
                    console.log(e)
                    //console.log(r.response)
                    document.querySelector(gtipS).innerText='CAPTCHA_SOLVED_BUT_CANT_BYPASS'
                }
            },
            onerror:r =>{console.log(r.response);document.querySelector(gtipS).innerText='Something is Wrong';}
        });}
    var timer = (x,res="Waiting for "+ x +"-seconds for captcha to be solved") => {
        if (x < 0) {
            getRes()
            return
        };
        document.title = x + '--' +title;
        try{document.querySelector(gtipS).innerText=res//"Waiting for "+ x +"-seconds for captcha to be solved"
           }
        catch(err){}
        return setTimeout(() => {
            timer(--x)
        }, 1000)
    }
    waitForKeyElements("[class*=geetest_btn_click]", (element) => {
        geetestButton=document.querySelector('.geetest_holder')
        addButton = document.createElement("button")
        addButton.setAttribute('class', 'title')
        addButton.innerText ="Click to solve"
        geetestButton.parentNode.insertBefore(addButton, geetestButton.nextSibling);
        addButton.addEventListener("click", function(e) {
            e.preventDefault();
            submit()
        })
        if(GM_getValue("SolveCaptcha", !1)){
            submit()
        }
    },false,500,100);

    var oldvalue;
    let check=setInterval(()=>{
        let element
        try{
            element = document.querySelector("[class*=captcha-solver-info]")
        }catch(e){null}
        if (element && element.innerText != oldvalue){
            try{document.querySelector("._info").remove()}catch(e){}
            document.title = element.innerText
            let main = document.querySelector(".captcha-solver")
            let addnew = document.createElement("p")
            addnew.setAttribute('class', '_info')
            addnew.innerText =element.innerText
            oldvalue = element.innerText
            main.parentNode.insertBefore(addnew, main.nextSibling);
        }else if(element&&/ERROR_+|IP_BANNED|Captcha+Solved/ig.test(element.innerText)){
            document.title = element.innerText
            clearInterval(check)
        }else{}
    },500)
    })();
