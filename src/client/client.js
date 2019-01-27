

var getTodoData = () => {
    return new Promise((resolve, reject) => {
        console.log('Requesting data')
        $.getJSON('/getTodos', 'Requesting todos',
            function (data, textStatus, jqXHR) {
                data = data.todos
                console.log(data, textStatus)
                if (data && data.length > 0) {
                    data.forEach(todoObject => {
                        renderTodo(todoObject)
                        resolve()
                    })
                } else {
                    reject()
                }
            }
        )
    })
}

var postTodo = (todoObject)=>{
    console.log('requested to post', todoObject)
    $.ajax({
        type: 'POST',
        url: '/postTodo',
        data: JSON.stringify(todoObject),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        success: function (response) {
            location.reload()
        }
    })
}

var todo = function (textDescription){
    this.text = textDescription
    this.completed = false
}

var renderTodo = (todoObject)=>{
    
    var todoDiv = $('<div></div>').addClass('todo my-4')
    var todoCheck = $('<input>').addClass('form-check-input ml-0').attr('type','checkbox').attr('name','checkbox').attr('id','checkbox'+todoObject._id).attr('checked',todoObject.completed)
    var todoTextDiv = $('<div></div>').addClass('todo-text ml-5 border-bottom').css({'width':'90%', 'border-color' : 'rgba(60, 255, 60, 0.5)'})
    var todoSpan = $('<span></span').css({'font-size':'large', 'font-family':'Verdana, Geneva, Tahoma, sans-serif'}).attr('id','textbox'+todoObject._id)
    todoSpan = (!todoObject.completed) ? todoSpan.text(todoObject.text) : todoSpan.html('<strike>'+todoObject.text+'</strike>')
    
    todoTextDiv.append(todoSpan)
    todoDiv.append(todoCheck,todoTextDiv)
    
    $('.todo-header').after(todoDiv)

}

var newTodo = ()=>{
    var todoInput = $('#todoInput').val()
    if(!todoInput || todoInput === ''){
        $('#todoInput').attr('placeholder','Please enter something first')
    }
    else{
        $('#todoInput').val('')
        $('#todoInput').attr('placeholder','Describe your todo here...')
        postTodo(new todo(todoInput))       
    }
}

var todoStateToggler = (todoToChange)=>{
    console.log('requested to modify', todoToChange)
    $.ajax({
        type: 'POST',
        url: '/modifyTodo',
        data: JSON.stringify(todoToChange),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        success: function (response) {
            updateTodo(response.resultTodo)
        }
    })
}

var updateTodo = (updatedTodo)=>{
    var text = updatedTodo.text
    if(!updatedTodo.completed)  $('#textbox'+updatedTodo._id).html(text)
    else  $('#textbox'+updatedTodo._id).html('<strike>'+ text +'</strike>')
}


var deleteCompleted = ()=>{
    $.getJSON('/deleteCompleted', 'Requesting to purge completed todos',
        function (data, textStatus, jqXHR) {
            if(data.count>0) location.reload()
        }
    )
}



