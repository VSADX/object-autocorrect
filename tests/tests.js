const ObjectAutocorrect = require('../index');
const tape              = require('tape');

tape('autocorrect property test', t => {
    t.plan(2);
    
    const myObj = {
        testProperty:  1,
        otherProperty: 2,
    };

    const myObjAutocorrect = new ObjectAutocorrect(myObj);

    t.equal(myObjAutocorrect.testsProperty,  myObj.testProperty );
    t.equal(myObjAutocorrect.othherProprety, myObj.otherProperty);
});

tape('autocorrect function test', t => {
    t.plan(2);

    const myObj = {
        testFunction:  () => 1,
        otherFunction: () => 2
    };

    const myObjAutocorrect = new ObjectAutocorrect(myObj);

    t.equal(myObjAutocorrect.myTestFunction(),    myObj.testFunction() );
    t.equal(myObjAutocorrect.someOtherfunction(), myObj.otherFunction());
});

tape('autocorrect mixed test', t => {
    t.plan(2);

    const myObj = {
        testProperty:        1,
        otherFunction: () => 2
    };

    const myObjAutocorrect = new ObjectAutocorrect(myObj);

    t.equal(myObjAutocorrect.theTestProperty,     myObj.testProperty   );
    t.equal(myObjAutocorrect.thatOtherFunction(), myObj.otherFunction());
});

tape('revocable autocorrect test', t => {
    t.plan(2);

    const myObj = {
        testProperty: {
            anotherProperty: 1
        }
    };

    const myObjRevocableAutocorrect = ObjectAutocorrect.revocable(myObj);
    
    //We need to convert this autocorrect object to a normal obect.
    const testPropToCheck = myObjRevocableAutocorrect.testProp.getTarget(); 
    t.equal(testPropToCheck, myObj.testProperty);

    const testProp = myObjRevocableAutocorrect.testProp;
    const extractedProp = testProp.getTarget();

    t.deepEqual(extractedProp, myObj.testProperty);

    try {
        //We want this to throw an error because it's been revoked by gettarget.
        testProp.anotherProperty;    
        
        //If it doens't throw an error, we simply fail the test.
        t.fail('Accessing the autocorrect object should have thrown an error.');
    } catch (err) {
        //Ignore the error.
        //TODO: Check for the right typeerror. Meh.
    }
});