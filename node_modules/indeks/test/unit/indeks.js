var expect = require('chai').expect;
var path = require('path');

describe('Indeks', function() {
  var indeks = require('../../index');

  describe('#getVarName', function() {
    it('should strip extensions.', function() {
      var gVN = indeks.getVarName;
      expect(gVN('index.js')).to.equal('index');
      expect(gVN('foo.js')).to.equal('foo');
      expect(gVN('bar.html')).to.equal('bar');
    });

    it('should lowerCamelCase.', function() {
      var gVN = indeks.getVarName;
      expect(gVN('index-test')).to.equal('indexTest');
      expect(gVN('kitten-blender.png')).to.equal('kittenBlender');
      expect(gVN('lumber-person.txt')).to.equal('lumberPerson');
    });
  });


  describe('#index', function() {
    it('should find all files of the given extension.', function(done) {
      var sampleDir = path.join(__dirname, '..', 'sample');
      var identity = function(x) { return x; };
      var files = indeks.index(sampleDir, {
        loader: identity
      });
      expect(files).to.have.keys(['fooBar', 'foo', 'baz']);

      files = indeks.index(sampleDir, {
        loader: identity,
        ext: '.txt'
      });
      expect(files).to.have.keys(['foobar', 'futz']);

      console.log('index');
      done();
    });
  });
});
