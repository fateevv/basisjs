require('basis.entity');
require('basis.data.index');
require('basis.data.dataset');


//
// Define todo type
//

var Todo = basis.entity.createType('Todo', {
  id: {
    type: basis.entity.IntId,
    defValue: function(){
      return basis.data.index.max(Todo.all, 'data.id').value + 1 || 1;
    }
  },
  title: String,
  completed: Boolean
});


//
// Datasets
//

var splitByCompleted = new basis.data.dataset.Split({
  source: Todo.all,
  rule: 'data.completed'
});

var IS_COMPLETED = true;
var IS_NOT_COMPLETED = false;

Todo.completed = splitByCompleted.getSubset(IS_COMPLETED, true);
Todo.active = splitByCompleted.getSubset(IS_NOT_COMPLETED, true);


//
// Dataset used for list
//

Todo.selected = new basis.data.Value({ value: Todo.all });


//
// Persistence
//

if (typeof localStorage != 'undefined')
{
  // read todo list from local storage
  var storedData = localStorage.getItem('todos-basisjs');
  if (storedData)
    Todo.readList(JSON.parse(storedData));

  // add handler to save todos on page unload
  basis.teardown(function(){
    localStorage.setItem('todos-basisjs', JSON.stringify(Todo.all.getValues('data')));
  });
}

module.exports = Todo;
