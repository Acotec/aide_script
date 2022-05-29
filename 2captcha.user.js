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
    const key = '1cb934a8562f7d3747256527188fbed3';
    const gtipS = ".geetest_tip"
    var title = document.title
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
                console.log(result,r.response);
                if(/ERROR_WRONG_USER_KEY|ERROR_KEY_DOES_NOT_EXIST|ERROR_ZERO_BALANCE/ig.test(result)){
                    try{document.querySelector(gtipS).innerText=result}catch(e){alert(result)}
                }
                if(/ERROR_NO_SLOT_AVAILABLE/ig.test(result)){
                    try{document.querySelector(gtipS).innerText=result+" Retrying after 5sec"}catch(e){alert(result)}
                    setTimeout(submit,5000)
                }
                else{
                    GM_setValue("id",parseInt(result.replace(/ok\|/ig,'')))}
            },
            onerror:r =>{console.log(r.response)}
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
                var answer = JSON.parse(r.response)
                GM_setValue('answer',JSON.stringify(answer));
                console.log(answer.request);
                var result = answer.request
                if(/CAPCHA_NOT_READY/ig.test(result)){
                    document.querySelector(gtipS).innerText=result
                    timer(10)
                }
                else{
                    document.getElementById("lot_number").value = result.lot_number;
                    document.getElementById("captcha_output").value = result.captcha_output;
                    document.getElementById("pass_token").value = result.pass_token;
                    document.getElementById("gen_time").value = result.gen_time;
                    document.querySelector(gtipS).innerText='DONE SOLVING CAPTCHA'
                }

            }
        });}
    var timer = (x,callback) => {
        if (x < 0) {
            getRes()
            return
        };
        document.title = x + '--' +title;
        try{document.querySelector(gtipS).innerText="Waiting for "+ x +"-seconds for captcha to be solved"}
        catch(err){}
        return setTimeout(() => {
            timer(--x)
        }, 1000)
    }
    waitForKeyElements("[href*=geetest]", (element) => {
        if(GM_getValue("SolveCaptcha", !1)){
            submit()
            timer(10)
        }
    });

})();
