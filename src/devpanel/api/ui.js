require('basis.data');
require('basis.data.dataset');

var inspectBasis = require('devpanel').inspectBasis;
var inspectBasisUI = inspectBasis.require('basis.ui');

var instances = {};
var updateInfoQueue = {};
var updateInfoTimer_ = null;

var config = { data: null };
var updateObj = { parent: null, satelliteName: null, groupNode: null, grouping: null };

var allInstances = new basis.data.Dataset();

function updateInfo(){
  var queue = updateInfoQueue;
  var models = [];

  updateInfoQueue = {};
  updateInfoTimer_ = null;

  console.log('updateInfo');
  for (var id in queue)
  {
    var model = queue[id];
    var instance = model.data.instance;
    var parent = instance.parentNode || instance.owner;
    updateObj.parent = parent && parent.basisObjectId;  // reuse updateObj to less GC
    updateObj.groupNode = instance.groupNode && instance.groupNode.basisObjectId;  // reuse updateObj to less GC
    updateObj.grouping = instance.grouping && instance.grouping.basisObjectId;
    updateObj.satelliteName = instance.ownerSatelliteName;
    instances[id].update(updateObj);
    models.push(model);
  }

  allInstances.add(models);
}

function processEvent(event){
  var instance = event.instance;
  var id = instance.basisObjectId;
  switch (event.action)
  {
    case 'create':
      //console.log('create', id);

      // reuse config for less garbage
      config.data = {
        id: instance.basisObjectId,
        instance: instance,
        parent: null
      };

      var model = new basis.data.Object(config);

      instances[id] = model;
      updateInfoQueue[id] = model;

      if (!updateInfoTimer_)
        updateInfoTimer_ = basis.setImmediate(updateInfo);

      break;

    case 'destroy':
      //console.log('destroy', id);

      var model = instances[id];
      delete instances[id];
      delete updateInfoQueue[id];
      model.destroy();

      break;
  }
}

inspectBasisUI.debug_notifier.attach(processEvent);
inspectBasisUI.debug_getInstances().map(function(instance){
  processEvent({
    action: 'create',
    instance: instance
  });
});

module.exports = {
  instanceMap: instances,
  instances: allInstances
};