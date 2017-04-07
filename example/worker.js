self.onmessage = function (e) {
    console.log('Received some data and/or command from the main script', e);

    //Do some calculations on the data here

    //Return the result
    console.log('Calculations are done, posting back');
    self.postMessage(true);
};