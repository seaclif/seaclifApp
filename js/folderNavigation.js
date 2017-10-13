if (Meteor.isClient) {

    currentFolderObj = undefined;

    folderList = new ReactiveVar();
    folderPath = new ReactiveVar();
    foldersReady = new ReactiveVar(false);

    Template.folderNavigation.helpers({
        previousPageSpecific:function(){
            console.log('previousPageSpecific', FlowRouter.current().params.configFor);
            var prev = FlowRouter.current().params.configFor.substring(1, FlowRouter.current().params.configFor.lastIndexOf('.')).toUpperCase();
            if(prev.length > 2){
                return prev;
            }
            else {
                return FlowRouter.current().params.configFor.substring(1).toUpperCase();
            }
        },
        folder:function(){
            return folderList.get();
        },
        folderPath:function(){
            return folderPath.get();
        },
        isNotDefaultFolder: function(){
            if(folderPath.get() === defaultFolder.substring(0,defaultFolder.length -1)){
                return false;
            }
            else{
                return true;
            }
        },
        foldersAreReady:function(){
            return foldersReady.get()
        }

    });

    upOneLevel = function(currentPath){
        return currentPath.substring(0, currentPath.lastIndexOf('/'))
    };

    Template.folderNavigation.events({
        'click .upOneLevel': function(){
            foldersReady.set(false);
            console.log(FlowRouter.current().queryParams.path);
            var cu = FlowRouter.current();

            FlowRouter.go('/folderNavigation/'+ cu.params.configFor + '?path=' + upOneLevel(cu.queryParams.path));
        },

        'click [class=item-link]':function(event){
            FlowRouter.go(FlowRouter.current().path +  '/' + $(event.target).attr('name'));
        },

        'click [name=backTo]': function(){
            FlowRouter.go('/' + FlowRouter.current().params.configFor.split('.').join('/'))
        }
    });

}