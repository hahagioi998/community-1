function comment() {
    var questionId = $("#questionId").val();
    var content = $("#content").val();
    var captcha = $("#captcha").val();
    sendComments(questionId, questionId, content, 1, captcha);
}


function twoLevelComment(e) {
    var parentId = e.getAttribute("data-id");
    var questionId = $("#questionId").val();
    var content = $("#second-content-" + parentId).val();
    var captcha = $("#second-captcha-" + parentId).val();
    sendComments(questionId, parentId, content, 2, captcha);
}


function sendComments(questionId, parentId, content, type, captcha) {
    if (content == null || content === "") {
        alert("评论内容不能为空！");
        return;
    }
    if (captcha == null || captcha === "") {
        alert("验证码不能为空！");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/api/comment",
        contentType: 'application/json',
        data: JSON.stringify({
            "questionId": questionId,
            "parentId": parentId,
            "content": content,
            "type": type,
            "captcha": captcha
        }),
        success: function (response) {
            console.log(response);
            if (response.code == 2003) {
                var isAccepted = confirm("你还没有登陆，请先登陆后再操作！");
                if (isAccepted) {
                    window.open("/sign-in");
                    window.localStorage.setItem("closable", "true");
                }
                return;
            }
            if(response.code == 200) {
                drowComment(response);
            } else {
                alert(response.message);
            }
        },
        dataType: "json"
    });
}

function drowComment(response) {
    // 先简单粗暴直接刷新
    window.location.reload();
}

/**
 * 显示二级评论
 * */
function showSecondComment(e) {
    var id = e.getAttribute("data-id");
    var comment = $("#comment-"+id);
    var collapse = e.getAttribute("data-collapse");
    var commentBody = $("#commentBody-" + id);
    if(collapse) {
        // 折叠
        comment.collapse('hide');
        e.removeAttribute("data-collapse");
        e.classList.remove("active");
        //commentBody.empty();

    } else {
        console.log("id    "  + id);
        console.log(commentBody.children().length);
        $.getJSON("/api/twoLevelComment/" + id, function (data) {
            if(commentBody.children().length != 1) {
                comment.collapse('show');
                e.setAttribute("data-collapse", "show");
                e.classList.add("active");
            } else {
                $.each(data.data.reverse(), function (index, userComment) {
                    var c = $("<div/>",{
                        "class": "media mt-3 mr-2 ml-2"
                    }).append($("<img/>",{
                        "class": "align-self-start mr-3 rounded-circle",
                        "src": userComment.user.headUrl,
                        "width": 35,
                        "height": 35
                    })).append($("<div/>", {
                        "class": "media-body"
                    }).append($("<div/>", {
                        "class": "row mt-0"
                    }).append($("<div/>", {
                        "class": "col"
                    }).append($("<a/>", {
                        "href": "/user/" + userComment.user.userId,
                        html: userComment.user.userName
                    })).append($("<spam/>", {
                        html: userComment.createTime
                    }))).append($("<div/>",{
                        "class": "col text-right"
                    }).append($("<a/>", {
                        "href": "#",
                        html: "编辑"
                    })).append($("<span/>", {
                        html: "&nbsp;"
                    })).append($("<a/>", {
                        "href": "#",
                        html: "删除"
                    })))).append($("<p/>", {
                        html: userComment.content
                    })).append($("<a/>", {
                        "href": "#"
                    }).append($("<img/>", {
                        "src": "/image/icon/clicklike.svg",
                        "height": 20
                    })).append($("<span/>", {
                        "class": "badge badge-light",
                        html: userComment.likeCount
                    }))).append($("<a/>", {
                        "href": "#"
                    }).append($("<img/>", {
                        "src": "/image/icon/comment.svg",
                        "height": 20
                    })).append($("<span/>", {
                        "class": "badge badge-light",
                        html: userComment.commentCount
                    }))).append($("<hr/>", {

                    })));
                    commentBody.prepend(c);
                });
            }
            comment.collapse('show');
            e.setAttribute("data-collapse", "show");
            e.classList.add("active");
        });

        comment.collapse('show');
        e.setAttribute("data-collapse", "show");
        e.classList.add("active");

    }
}

function alterLikeButtonClass() {

}


function clickLikeQuetion(e) {
    var notifier = $("#now-online-user-id").val();
    console.log(notifier);
    if(notifier==null) {
        alert("请先登陆！");
        return;
    }
    var questionId = e.getAttribute("questionid-data");
    var receiver = e.getAttribute("receiver-data");
    var ClickLikeDTO = {
        notifier: notifier,
        receiver: receiver,
        questionId: questionId,
        commentId: -1
    };

    var likeCount = document.getElementById("like-button-number").innerText;
    fetch("/api/clickLike", {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(ClickLikeDTO), // data can be `string` or {object}!
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }).then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(function (response) {
        if(response.success) {
            document.getElementById("like-button-number").innerText = (parseInt(likeCount) + 1);
            document.getElementById("like-button").className = "btn btn-primary btn-sm mb-0";
        } else {
            alert(response.msg);
        }
    });
}
