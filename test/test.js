const _s = require('../index');
const expect = require('chai').expect;

module.exports = [
  ['assert',
   ['throws error', () => {
     const failer = () => {
       _s.assert(false, 'failed');
     };
     expect(failer).to.throw(Error);
     expect(failer).to.throw(_s.AssertionError);
     expect(failer).to.throw('failed');
   }],
  ],
];
