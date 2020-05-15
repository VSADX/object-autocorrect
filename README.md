# object-autocorrect
A module that wraps an object in a Proxy for autocorrecting.

### About

With this simple module you can wrap objects in an autocorrector.

Imagine you have this object:

    const myObject = {
        someField: 'a value',
        secondField: {
            anotherField: 'value two',
            andSomeFunction: () => 'result'
        }
    };

Now you can wrap this in an autocorrecter and do this:

    myAutocorrectObject.scondfeild.somefuncTion(); // -> 'result'

### Documentation

To wrap an object into an autocorrector simply require it and call the constructor like this:

    const ObjectAutocorrect = require('object-autocorrect');

    const myObject = { ... };
    const myAutocorrectObject = new ObjectAutocorrect(myObject);

This will return a Proxy which will act like an autocorrecter.

You might have noticed that in my previous example, if you call

    myAutocorrectObject.secondField;

You will get an autocorrect object.

To get the regular object you want, you have to call `getTarget()` on it.  
So:

    myAutocorrectObject.secondField.getTarget(); // -> { anotherField: [String], andSomeFunction: [Function] }

You can also create a revocable autocorrecter. That means that accessing the original autocorrect object will throw an exception.  
Example:

    myRevocableAutocorrectObj = ObjectAutocorrect.revocable(myObj); //Note the lack of the keyword 'new'.

    const objField = myRevocableAutocorrectObj.secndField.getTarget(); // -> { anotherField: [String], andSomeFunction: [Function] }

    myRevocableAutocorrectObj.secndField.antherFeld; // -> Will throw a TypeError

### Testing

If you install this module with the dev dependencies (no `--production` flag), you can run tests in `/tests/test.js` by executing `npm test`.
