var baseUrl = "http://twobias.synology.me/proxy/proxy.php?url=http%3A%2F%2Fwww.lectio.dk%2Flectio%2F";
var scrapeUrl;
var schoolUrl;

var getSchoolIdsFromLectio = function () {
  var schoolsUrl = "login_list.aspx";
  scrapeUrl = baseUrl + schoolsUrl; 
  scrapeSchoolIdsFromLectio(scrapeUrl);
};

var scrapeSchoolIdsFromLectio = function (sourceUrl) {  
  $.ajax({
    url: sourceUrl,
    type: "get",
    dataType: "html",
    success: function(data) {
      //extract school names and IDs from buttons on webpage
      var links = data.split('<div class=\\"buttonHeader textLeft \\"><a href=\'');
      for (var n = 1; n < links.length; n++) {
        var src;
        var linkText;
        //if (links[n].search("'>") != -1) {
          linkText = links[n].substring(links[n].search("'>") + 2);
          linkText = linkText.substring(0, linkText.search('<'));
          linkText = htmlDecode(linkText);
          //console.log(linkText);
          src = links[n].substring(links[n].search("/lectio/") + 11);
          src = src.substring(0, src.search('\\\\'));
          //console.log(src);
          $('select#school').append($('<option></option>').attr("value", src).text(linkText));
        //}
      }
      loadClasses()
    },
    error: function(status) {
      console.log("request error:" + sourceUrl + status.textError);
    }
  });
};

var getClassIdsFromLectio = function () {
  schoolUrl = $("select#school").val() + "%2F";
  var classesUrl = "FindSkema.aspx?type=stamklasse";
  scrapeUrl = baseUrl + schoolUrl + classesUrl; 
  scrapeClassIdsFromLectio(scrapeUrl);
  //console.log(scrapeUrl);
};

var scrapeClassIdsFromLectio = function (sourceUrl) {  
  $.ajax({
    url: sourceUrl,
    type: "get",
    dataType: "html",
    success: function(data) {
      //extract class names and class IDs from table
      var links = data.split("<a  ");
      for (var n = 1; n < links.length; n++) {
        var src = links[n].substring(links[n].search("href='"));
        if (links[n].search("klasseid=") != -1) {
          src = links[n].substring(links[n].search("klasseid=") + 9);
          src = src.substring(0, src.search("'>"));
          var linkText = links[n].substring(links[n].search("'>") + 2);
          linkText = linkText.substring(0, linkText.search("<\\\\/a"));
          $('select#class').append($('<option></option>').attr("value", src).text(linkText));
        }
      }          
    },
    error: function(status) {
      console.log("request error:" + sourceUrl + status.textError);
    }
  });
};

var importClassFromLectio = function (event) {
  event.preventDefault();
  clearPeople();
  schoolUrl = $("#school").val() + "%2F";
  var classId = $("#class").val();
  var classUrl = "subnav%2Fmembers.aspx%3Fklasseid%3D" + classId + "%26showstudents%3D1&mode=native";
  scrapeUrl = baseUrl + schoolUrl + classUrl;
  scrapeClassFromLectio(scrapeUrl);
};

var scrapeClassFromLectio = function (sourceUrl) {  
  var html;
  $.ajax({
    url: sourceUrl,
    type: "get",
    dataType: "html",
    success: function(data) {
      //extract names from table
      var studentName = [];
      for (var i=1; i<40; i++)
      { 
        var iText = i;
        if (i <= 9) {
          iText = "0" + i;
        }
        if (data.search(" " + iText + '</span></td>') != -1) {//if student exists
        //console.log(iText);
          studentName[i] = data.substring(data.search(' ' + iText + '</span></td>') + 3);
          studentName[i] = studentName[i].substring(0, studentName[i].search('</span></td><td class="nowrap"><span'));
          studentName[i] = studentName[i].replace(/(<([^>]+)>)/ig,""); //remove all html <tags>
          //console.log(studentName[i]);
          studentName[i] = htmlDecode(studentName[i]); //decode html-chars such as &aring;
          studentName[i] = studentName[i].replace(/\r?\n|\r/g," "); //replace newlines with spaces
          studentName[i] = studentName[i].replace(/[ \t\r]+/g," "); //remove extra whitespace, tabs etc
          //change middle names to initials
          var names = studentName[i].split(" ");
          names.shift(); //remove first empty space name
          var midNames = 0;
          for (var n = 1; n < names.length - 1; n++) {
            names[n] = names[n].charAt(0);
            midNames = n;
          }
          studentName[i] = names[0]; 
          for (var m = 0; m < midNames; m++) {
            studentName[i] += " " + names[m+1] + ".";
          }
          studentName[i] += " " + names[m+1];
          addPerson(studentName[i], false);
        }
      }
      saveToLocal();
    },
    error: function(status) {
      console.log("request error:" + sourceUrl + status.textError);
    }
  });
};