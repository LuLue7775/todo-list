// Selectors

const toDoInput = document.querySelector('.todo-input');
const toDoInputDate = document.querySelector('.todo-date');
const toDoBtn = document.querySelector('.todo-btn');
const toDoListContainer = document.querySelector('.todo-list-container');
const standardTheme = document.querySelector('.standard-theme');
const lightTheme = document.querySelector('.light-theme');
const darkerTheme = document.querySelector('.darker-theme');
const sortDateContainer = document.querySelector('.sort-date-container');
// const sortDate = document.querySelector('.sort-date-btn');
// const sortDateCheckbox = document.querySelector('.sort-date-checkbox');

// Event Listeners

toDoBtn.addEventListener('click', addToDo);
toDoListContainer.addEventListener('click', deleteOrMark);
document.addEventListener("DOMContentLoaded", rerenderTodos);
standardTheme.addEventListener('click', () => changeTheme('standard'));
lightTheme.addEventListener('click', () => changeTheme('light'));
darkerTheme.addEventListener('click', () => changeTheme('darker'));
// sortDateContainer.addEventListener('click', toggleSortDate);

function toggleSortDate() {
    var isActive;

    if( !sortDate.classList.contains('active') ) {
        sortDate.classList.add('active');
        isActive = true;
    } else {
        sortDate.classList.remove('active');
        isActive = false;
    }

    if (sortDate.classList.contains('sort-date-checkbox')) {
        if (isActive) {
            sortDateCheckbox.checked = true;
        } else {
            sortDateCheckbox.checked = false;
        }
    }

    sortTodos('date', null, isActive);
}

// Check if one theme has been set previously and apply it (or std theme if not found):
let savedTheme = localStorage.getItem('savedTheme');
savedTheme === null ?
    changeTheme('standard')
    : changeTheme(localStorage.getItem('savedTheme'));

// Handle input date 

let today = new Date();
let dd = today.getDate();
let mm = today.getMonth() + 1; //January is 0!
let yyyy = today.getFullYear();
if (dd < 10) { dd = '0' + dd; };
if (mm < 10) { mm = '0' + mm; }; 
toDoInputDate.setAttribute("value", `${yyyy}-${mm}-${dd}`)

// Functions;
function addToDo(event) {
    event.preventDefault();

    // toDo DIV;
    const toDoDiv = document.createElement("div");
    toDoDiv.classList.add('todo', `${savedTheme}-todo`);

    let itemId = Date.now(); // uuid for a task 
    toDoDiv.setAttribute('id', itemId );

    // Create LI
    const newToDo = document.createElement('li');
    if (toDoInput.value === '') {
            alert("You must write something!");
        } 
    else {

        const taskName = document.createElement('div');
        const taskTime = document.createElement('div');

        taskName.innerText = toDoInput.value;
        taskName.classList.add('todo-name');
        newToDo.appendChild(taskName);

        let todoDate = toDoInputDate.value;
        taskTime.innerText = todoDate;
        taskTime.classList.add('todo-time');
        newToDo.appendChild(taskTime);
        

        toDoDiv.appendChild(newToDo);

        // Adding to local storage;
        savelocal({ name: toDoInput.value, status:'todo', date: todoDate, uuid: itemId });

        // check btn;
        const checked = document.createElement('button');
        checked.innerHTML = '<i class="fas fa-check"></i>';
        checked.classList.add('check-btn', `${savedTheme}-button`);
        toDoDiv.appendChild(checked);
        // delete btn;
        const deleted = document.createElement('button');
        deleted.innerHTML = '<i class="fas fa-trash"></i>';
        deleted.classList.add('delete-btn', `${savedTheme}-button`);
        toDoDiv.appendChild(deleted);

        // Append to specific date list; create a new date table if not exist.
        const whichDate = document.getElementById(todoDate);
        if ( !whichDate) {
            const tasksByDate = document.createElement("ul");
            tasksByDate.classList.add("tasklists-by-date");
            tasksByDate.setAttribute("id", todoDate);
            tasksByDate.innerHTML = todoDate;

            tasksByDate.appendChild(toDoDiv);
            toDoListContainer.appendChild(tasksByDate);

        } else {
            whichDate.appendChild(toDoDiv);
        }
        
        sortTodos('date');

        // CLearing the input;
        toDoInput.value = '';
    }

}   


function deleteOrMark(event){

    const item = event.target;
    let todoItem = item.parentElement;
    let todoDateTableID = item.parentElement.parentElement.id;
    // console.log(item.parentElement.parentElement);

    // delete
    if(item.classList[0] === 'delete-btn')
    {
        // item.parentElement.remove() animation
        item.parentElement.classList.add("fall");

        //removing local todos;
        removeLocalTodos(todoItem, todoDateTableID);

        item.parentElement.addEventListener('transitionend', function(){
            item.parentElement.remove();
        })
    }

    // check
    if(item.classList[0] === 'check-btn')
    {
        item.parentElement.classList.toggle("completed");
        markLocalTodos(todoItem, todoDateTableID);
    }
}

function sortTodos(sortTag, dateTableID, dateToggle) {
    let todos = JSON.parse(localStorage.getItem('todos'));
    
    switch (sortTag) {
        case 'status': 
            const getTodos = todos[dateTableID].filter(elem => elem.status === "todo" );
            const getDones = todos[dateTableID].filter(elem => elem.status === "done" );
            todos[dateTableID] = [...getTodos, ...getDones];

            localStorage.setItem('todos', JSON.stringify( todos ) );         
            break;
        case 'date':
            let sortedToDos = Object.keys(todos)
            .sort()
            .reduce((acc, key) => {
                acc[key] = todos[key];
            
                return acc;
            }, {});

            localStorage.setItem('todos', JSON.stringify( sortedToDos ) );         
            break;
        case 'name':
    }

    rerenderTodos(); 

}


function rerenderTodos() {

    // to ensure children are clear when it's not a page refresh. 
    if ( toDoListContainer.hasChildNodes() ) {
        toDoListContainer.replaceChildren();
    }
    
    //Check: if item/s are there;
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = [];
    }
    else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    
    for ( let dateTasks in todos ) {

        // create ul by date. but dont render a date table anymore if task is empty.
        if ( todos[dateTasks].length === 0 ) {
            const dateTable = document.getElementById(dateTasks);
            continue;
        }

        const tasksByDate = document.createElement("ul");
        tasksByDate.classList.add("tasklists-by-date");
        tasksByDate.setAttribute("id", dateTasks);
        tasksByDate.innerHTML = dateTasks;

        todos[dateTasks].forEach(function(todo) {

            // toDo DIV;
            const toDoDiv = document.createElement("div");

            if (todo.status === 'todo') {
                toDoDiv.classList.add("todo", `${savedTheme}-todo`);
            } else {
                toDoDiv.classList.add("todo", `${savedTheme}-todo`, "completed");
            }
    
            let itemId = todo.uuid; // uuid for a task 
            toDoDiv.setAttribute("id", itemId );
    
            // Create LI
            const newToDo = document.createElement('li');
            const taskName = document.createElement('div');
            const taskTime = document.createElement('div');
    
            taskName.innerText = todo.name;
            taskName.classList.add('todo-name');
            newToDo.appendChild(taskName);
    
            taskTime.innerText = `task created at ${todo.date}`;
            taskTime.classList.add('todo-time');
            newToDo.appendChild(taskTime);
            toDoDiv.appendChild(newToDo);
            
            // check btn;
            const checked = document.createElement('button');
            checked.innerHTML = '<i class="fas fa-check"></i>';
            checked.classList.add("check-btn", `${savedTheme}-button`);
            toDoDiv.appendChild(checked);
            // delete btn;
            const deleted = document.createElement('button');
            deleted.innerHTML = '<i class="fas fa-trash"></i>';
            deleted.classList.add("delete-btn", `${savedTheme}-button`);
            toDoDiv.appendChild(deleted);
    
            // Append to list;
            tasksByDate.appendChild(toDoDiv);
    
        });

        toDoListContainer.appendChild(tasksByDate);
    }

}

// Saving to local storage:
function savelocal(todo){
    //Check: if item/s are there;
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = {};
    }
    else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    if ( !(todo.date in todos) ) {
        todos[todo.date] = [];
    }
    todos[todo.date].push(todo);

    localStorage.setItem('todos', JSON.stringify(todos));
}

function markLocalTodos(todo, dateTableID){
    //Check: if item/s are there;
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = [];
    }
    else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    const todoTable = todos[dateTableID];
    const todoIndex =  todoTable.findIndex((elem) => elem.uuid === parseInt(todo.id) );
    // console.log(todoIndex);
    todoTable[todoIndex].status = "done";
    // console.log(todos);
    localStorage.setItem('todos', JSON.stringify( todos ));
    sortTodos('status', dateTableID);
}

function removeLocalTodos(todo, dateTableID){
    //Check: if item/s are there;
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = [];
    }
    else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    const todoIndex =  todos[dateTableID].findIndex((elem) => elem.uuid === parseInt(todo.id) );
    // console.log(todoIndex);
    todos[dateTableID].splice(todoIndex, 1);
    // console.log(todos[dateTableID]);
    localStorage.setItem('todos', JSON.stringify(todos));

    if ( !todos[dateTableID].length ) {
        delete todos[dateTableID];
        localStorage.setItem('todos', JSON.stringify(todos));
        rerenderTodos();
    }
}



// Change theme function:
function changeTheme(color) {
    localStorage.setItem('savedTheme', color);
    savedTheme = localStorage.getItem('savedTheme');

    document.body.className = color;
    // Change blinking cursor for darker theme:
    color === 'darker' ? 
        document.getElementById('title').classList.add('darker-title')
        : document.getElementById('title').classList.remove('darker-title');

    document.querySelector('input').className = `${color}-input`;
    // Change todo color without changing their status (completed or not):
    document.querySelectorAll('.todo').forEach(todo => {
        Array.from(todo.classList).some(item => item === 'completed') ? 
            todo.className = `todo ${color}-todo completed`
            : todo.className = `todo ${color}-todo`;
    });
    // Change buttons color according to their type (todo, check or delete):
    document.querySelectorAll('button').forEach(button => {
        Array.from(button.classList).some(item => {
            if (item === 'check-btn') {
              button.className = `check-btn ${color}-button`;  
            } else if (item === 'delete-btn') {
                button.className = `delete-btn ${color}-button`; 
            } else if (item === 'todo-btn') {
                button.className = `todo-btn ${color}-button`;
            }
        });
    });
}