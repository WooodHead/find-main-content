// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'

var candidates = []
var o = 5;

function handleSpecialChar(off, end) {
  return (end || ".") + off.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&").trim();
}

function getSelector(ele) {
  return $(ele).parents().addBack().not("html").not("body").map(function () {
    var source = this.tagName.toLowerCase();
    return "string" == typeof this.id && (this.id.trim() && !this.id.match(/\d+/g))
      ? source += handleSpecialChar(this.id, "#")
      : "string" == typeof this.className && (this.className.trim() && (source += handleSpecialChar(this.className).replace(/ +/g, "."))), source;
  }).get().join(" ");
}

function c(text) {
  return (text.attr("class") || "").trim().split(/\s+/).filter(function (dataAndEvents) {
    return dataAndEvents;
  });
}


function d(ele) {

  function _init(sel, options) {
    var codeSegments = options.split(" ");
    var i = 0;
    for (; i < codeSegments.length; i++) {
      if (!sel.hasClass(codeSegments[i])) {
        return false;
      }
    }
    return true;
  }

  var lis = $(ele).children();
  var table = {};
  var self = {};
  lis.each(function () {
    if (!["script", "img"].includes(this.nodeName.toLowerCase()) && $(this).text().trim().length) {
      var leaks = c($(this)).sort().filter(function (optionsString) {
        return !optionsString.match(/\d/);
      });
      var callbackSymbol = leaks.join(" ");
      if (!(callbackSymbol in self)) {
        self[callbackSymbol] = 0;
      }
      self[callbackSymbol]++;
      leaks.forEach(function (str) {
        if (!(str in table)) {
          table[str] = 0;
        }
        table[str]++;
      });
    }
  });


  var assertions = Object.keys(self).filter(function (sMethodName) {
    return self[sMethodName] >= lis.length / 2 - 2;
  });

  return assertions.length || (assertions = Object.keys(table).filter(function (verb) {
    return table[verb] >= lis.length / 2 - 2;
  })), lis.filter(function () {
    var errorFound = false;
    var sel = $(this);
    return assertions.forEach(function (options) {
      errorFound |= _init(sel, options);
    }), errorFound;
  });
}

var n = 0
function highlightSelectedTable() {
  /** @type {number} */
  var i = (n + candidates.length - 1) % candidates.length;
  console.log('i', i)
  $(candidates[i].table).removeClass("tablescraper-selected-table");
  $(candidates[i].children).removeClass("tablescraper-selected-row");
  $(candidates[n].table).addClass("tablescraper-selected-table");
  $(candidates[n].children).addClass("tablescraper-selected-row");
}

function findContent() {
  if (!candidates.length) {
    $("body *").each(function () {
      var widthHeight = $(this).width() * $(this).height();
      var data = d(this);
      var dataLength = data.length;
      var score = widthHeight * dataLength * dataLength;
      if (!isNaN(score)) {
        candidates.push({
          table: this,
          area: widthHeight,
          children: data,
          text: data.text(),
          score: score,
          selector: getSelector(this)
        });

        var bestArea = widthHeight;

        var bestScore = score;
        var bestChildren = data;
        var bestTable = this;
      }
    });
    candidates = candidates.sort(function (a, b) {
      return a.score > b.score
        ? -1
        : a.score < b.score
          ? 1
          : 0;
    }).slice(0, o);
    console.log("Best tables:", candidates);
  }
}

findContent()
highlightSelectedTable()