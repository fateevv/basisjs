
  basis.require('app.core');
  basis.require('app.view');

  var getter = Function.getter;
  var classList = basis.cssom.classList;

  var InheritanceItem = basis.ui.Node.subclass({
    className: module.path + '.InheritanceItem',
    template: resource('template/inheritanceItem.tmpl'),

    binding: {
      className: 'data:title',
      namespace: 'data:',
      fullPath: 'data:',
      tag: 'data:tag || "none"'
    },
    event_match: function(){
      this.tmpl.set('absent', 'absent');
    },
    event_unmatch: function(){
      this.tmpl.set('absent', '');
    }
  });

  var viewInheritance = new app.view.ViewList({
    title: 'Inheritance',
    viewHeader: 'Inheritance',

    childClass: InheritanceItem,

    template: resource('template/inheritanceView.tmpl'),

    groupingClass: {
      childClass: {
        template: resource('template/inheritanceGroup.tmpl'),

        binding: {
          title: 'data:'
        }
      }
    },

    matchFunction: function(node){
      return node.data.match;
    },

    handler: {
      groupingChanged: function(){
        this.tmpl.set('show_namespace', this.grouping ? '' : 'show-namespace');
        //classList(this.tmpl.content).bool('show-namespace', !this.grouping);
      },
      update: function(){
        this.clear();

        var key = this.data.key;
        if (key)
        {
          var isClass = this.data.kind == 'class';
          var cursor = isClass ? this.data.obj : (mapDO[this.data.path.replace(/.prototype$/, '')] || { data: { obj: null } }).data.obj;
          var groupId = 0;
          var group;
          var lastNamespace;
          var list = [];
          while (cursor)
          {
            var fullPath = cursor.className;
            var namespace = (fullPath || 'unknown').replace(/\.[^\.]+$|^[^\.]+$/, '');
            var proto = cursor.docsProto_ && cursor.docsProto_.hasOwnProperty(key) ? cursor.docsProto_[key] : null;

            if (namespace != lastNamespace)
            {
              lastNamespace = namespace;
              group = new basis.data.DataObject({
                data: {
                  title: namespace,
                  namespace: namespace
                }
              })
              groupId++;
            }

            list.push(new basis.data.DataObject({
              group: group,
              data: {
                match: isClass || (proto && proto.tag),
                cls: cursor,
                namespace: namespace,
                fullPath: fullPath,
                title: (fullPath || 'unknown').match(/[^\.]+$/)[0],
                tag: proto ? proto.tag : ''
              }
            }));

            cursor = cursor.superClass_;
          }

          this.setChildNodes(list.reverse());
        }
      }
    },

    satelliteConfig: {
      viewOptions: {
        instanceOf: app.view.ViewOptions,
        config: function(owner){
          return {
            title: 'Group by',
            childNodes: [
              {
                title: 'Namespace',
                selected: true,
                handler: function(){
                  owner.setGrouping({
                    groupGetter: getter('delegate.group'),
                    childClass: {
                      titleGetter: getter('data.title')
                    }
                  });
                }
              },
              {
                title: 'None',
                handler: function(){
                  owner.setGrouping();
                }
              }
            ]
          }
        }
      }
    }
  });

  //
  // exports
  //
  module.exports = viewInheritance;
