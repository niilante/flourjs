
var flour = flour || {};




/*
#
#	Push state
#
*/
flour.pushState = function(url, data, title)
{
	title = title === undefined ? flour.config('title') : title;
	data = data === undefined ? {} : data;

	history.pushState(data, title, url);
	flour.publish('history:state_change', data);
};




/*
#
#	Returns true if passed param is an object, else false
#
*/
flour.isObject = function(obj)
{
	if((typeof obj == "object") && (obj !== null))
	{
	  return true;
	}
	
	return false;
};



/*
#
#	Returns true if passed param is an array, else false
#
*/
flour.isArray = function(arr)
{
	if( Object.prototype.toString.call( arr ) === '[object Array]' ) {
	  return true;
	}
	return false;
};




/*
#
#	Returns true if passed param is an object, else false
#
*/
flour.isFunction = function(func) 
{
 var getType = {};
 return func && getType.toString.call(func) === '[object Function]';
};



/*
#
#	Returns true is passed param is a string, else false
#
*/
flour.isString = function(str)
{
	if (typeof str == 'string' || str instanceof String)
	{
		return true;
	}
	else
	{
		return false;
	}
};






/*
#
#	Returns the string with an s if it's more than 1
#
*/
flour.pluralize = function(string, number)
{
	return number === 1 ? string : string + 's';
};




/*
#
#	Converts a rgb to hex
#
*/
flour.rgb2hex = function(rgb)
{
  if (/^#[0-9A-F]{6}$/i.test(rgb))
  {
    return rgb;
  }

  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) 
  {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }

  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
};




/*
#
#	Filter and return a readable file size format
#
*/
flour.readableBytes = function(bytes) 
{
	bytes = parseInt(bytes);
	if(bytes === 0){ return 0; }
  var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
  var e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e]; 
};




/*
#
#	Truncates a string
#
*/
flour.truncate = function(str, len)
{	
	if(str && str.length > len && str.length > 0) 
  {
    var new_str = str + " ";
    new_str = str.substr (0, len);
    new_str = str.substr (0, new_str.lastIndexOf(" "));
    new_str = (new_str.length > 0) ? new_str : str.substr (0, len);

    return new_str;
  }

  return str;
};




/*
#
#	Defer execution
#
*/
flour.defer = function(callback)
{
	setTimeout(callback, 0);
};




/*
#
#	Map a string value to an object
#
*/
flour.setObjectKeyValue = function(object, key, value)
{
	if(key.indexOf('.') !== -1)
	{
		var pieces = key.split('.');
		var objectPoint = object;

		for(var i = 0, n = pieces.length; i < n; i ++)
		{
			var nextPoint = pieces[i];

			if(i === (n - 1))
			{
				objectPoint[nextPoint] = value;
			}
			else
			{
				if(objectPoint[nextPoint] === undefined)
				{
					objectPoint[nextPoint] = {};
				}

				objectPoint = objectPoint[nextPoint];
			}
		}
	}
	else
	{
		object[key] = value;
	}
}




/*
#
# Set flour app config vars : TODO
#
*/
flour.configValues = {};

flour.config = function(param, value)
{
	if(param === undefined)
	{
		return flour.configValues;
	}

	// If object, set all object key -> values
	if(flour.isObject(param))
	{
		for(var paramName in param)
		{
			flour.configValues[paramName] = param[paramName];
		}
	}
	else
	{
		// Setter getter behaviour
		if(value === undefined)
		{
			return flour.configValues[param];
		}
		else
		{
			flour.configValues[param] = value;
		}
	}
};




/*
#
#	Generates a lookup hash table
#
*/
flour.generateLookup = function(data, key)
{
	if(flour.isArray(data))
	{
		var lookup = {};
		for(var i = 0, n = data.length; i < n; i ++)
		{
			var item = data[i];
			if(item[key])
			{
				lookup[item[key]] = i;
			}
		}

		return lookup;
	}

	return false;
}




/*
#
#	Extracts and analysis a form submission, returns a formatted object with errors
#
*/
flour.validateFormData = function(form)
{
	var formData = {};
	var errors = {};
	var hasErrors = false;
	var inputs = form.find('input, textarea, select');


	// retrieve input data
	$.each(inputs, function(index, input)
	{
		// input name
		$input = $(input);

		var name = $input.attr('name');

		// $input value
		if($input[0].type === 'select-multiple')
		{
			var value = [];
			var options = $input.find('option');
			
			$.each(options, function(index, option)
			{
				var $option = $(option);
				if($option.data('selected'))
				{
					value.push($option.attr('value'));
				}
			});
		}
		else if($input[0].type === 'checkbox') 
		{
			var value = $input[0].checked ? true : false;
		}
		else
		{
			var value = $input.val();	
		}


		// check for not blank
		if($input.hasClass('validate'))
		{
			if($input[0].type === 'select-multiple')
			{
				if(value.length === 0)
				{
					errors[name] = 'empty';
					hasErrors = true;
				}	
			}
			else
			{
				if(value === '' || value === false)
				{
					errors[name] = 'empty';
					hasErrors = true;
				}
			}
		}

		// check for valid email
		if($input.hasClass('validate-email'))
		{
			if(!flour.test.email(value))
			{
				errors[name] = 'invalid';
				hasErrors = true;
			}
		}

		// add value to form data
		formData[name] = value;
	});


	return {
		data: formData,
		errors: hasErrors ? errors : false
	};
};


