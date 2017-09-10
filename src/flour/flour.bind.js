
var flour = flour || {};


/*
|
| Our flour.bind name space, everything goes in 'ere
|
*/
flour.bind = {};

flour.bind.binders = {};

flour.bind.prefix = 'flour';



/*
|
| Add a binder method to our object
|
*/
flour.addBinder = function(name, methods)
{
  flour.bind.binders[name] = methods;
};




/*
|
| Bind a view
|
*/
flour.bindView = function(view)
{
  var $elements = [];
  var listeners = [];
  var bindingPrefix = flour.bind.prefix;


  view.on('render', function()
  {
    // Clear any previous listeners added
    for(var i = 0, n = listeners.length; i < n; i ++)
    {
      var listener = listeners[i];
      view.off(listener.eventName, listener.eventCallback);
    }

    // Find elements matching our binders
    for(var bindingName in flour.bind.binders)
    {
      (function(){

        var options = flour.bind.binders[bindingName];
        var attribute = bindingPrefix + '-' + bindingName;
        $elements.length = 0;
        $elements = view.find('[' + attribute + ']');

        //
        // Itterate over our bound elements
        //
        $elements.each(function(index, el)
        {
          var $el = $(el);
          var bindOn = $el.attr(attribute);
          var filter = false;
          var condition = false;
          var filterParams = undefined;
          


          //
          //  Our handler methods
          //
          var onChangeHandler = function(data)
          {
            options.update($el, data);
          };

          var filterData = function(data)
          {
            if(flour.filters[filter] !== undefined)
            {
              data = flour.filters[filter](data, filterParams);
            }
            else if(view[filter] !== undefined)
            {
              data = view[filter](data, filterParams);
            }

            return data;
          };

          var testCondition = function(data)
          {
            return data == condition;
          };


        
          //
          // Check for load
          //
          if(options.attach)
          {
            options.attach($el, bindOn, view);
          }



          //
          // Parse the attribute 
          //
          bindOn = bindOn.replace(/\s/g, "");
          var hasFilter = bindOn.indexOf('|') === -1 ? false : true;
          var isConditional = bindOn.indexOf('=') === -1 ? false : true;

          // Parse filter and filter params
          if(hasFilter)
          {
            var pieces = bindOn.split('|');
            bindOn = pieces[0];
            filter = pieces[1];

            if(filter.indexOf(':') !== -1)
            {
              var pieces = filter.split(':');
              filter = pieces[0];
              filterParams = pieces[1];

              var lastCharIndex = filterParams.length - 1;
              if((filterParams[0] === '\'' || filterParams[0] === '"') && (filterParams[lastCharIndex] === '\'' || filterParams[lastCharIndex] === '"'))
              {
                filterParams = filterParams.substring(1, lastCharIndex);
              }
            }

            onChangeHandler = function(data)
            {
              options.update($el, filterData(data));
            }
          }

          // Parse condition
          if(isConditional)
          {
            var pieces = bindOn.split('=');
            bindOn = pieces[0];
            condition = pieces[1];

            onChangeHandler = function(data)
            {
              options.update($el, testCondition(data));
            };
          }

          // Set change event after we've checked for filters and conditions
          var changeEvent = 'model.' + bindOn + ':change';



          //
          // Add event listeners
          //
          if(options.update)
          {
            // Store listeners
            listeners.push({
              'eventName': changeEvent,
              'eventCallback': onChangeHandler
            });

            // 
            view.on(changeEvent, onChangeHandler);

            // set initial
            var data = view.get(bindOn);
            onChangeHandler(data);
          }

        });

      }());
    }
  });
}





/*
|
| Bind a list, parses an empty template for bindings
|
*/
flour.bindList = function(list, template)
{
  var $elements = [];
  var listeners = [];
  var bindingPrefix = flour.bind.prefix;


  
  var $template = $(flour.getTemplate(template)({}));

  // Find elements matching our binders
  for(var bindingName in flour.bind.binders)
  {
    (function(){
      
      var options = flour.bind.binders[bindingName];
      var attribute = bindingPrefix + '-' + bindingName;
      $elements.length = 0;
      $elements = $template.find('[' + attribute + ']');

      $elements.each(function(index, el)
      {
        var $el = $(el);
        var bindOn = $el.attr(attribute);
        var filter = false;

        bindOn = bindOn.replace(/\s/g, "");
        var hasFilter = bindOn.indexOf('|') === -1 ? false : true;
      
        var bindOn = $el.attr(attribute);
        var updateSelector = '[' + attribute + '="' + bindOn + '"]';

        list.addBinding(bindingName, bindOn, updateSelector);
      });

    }());
  }
}