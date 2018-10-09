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
      loadClasses();
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
          var r = /\\u([\d\w]{4})/gi; //find unicode escape sequences
          linkText = linkText.replace(r, function (match, grp) {
            return String.fromCharCode(parseInt(grp, 16)); 
          } );
          linkText = unescape(linkText);
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
      var studentNames = studentNamesFromHtml(data);
      for (var n = 0; n < studentNames.length; n++) {
        addPerson(studentNames[n], false);
      }
      saveToLocal();
    },
    error: function(status) {
      console.log("request error:" + sourceUrl + status.textError);
    }
  });
};

var studentNamesFromHtml = function(html) {
  var sNames = [];
  //regex search to search for table lines with student
  //e.g.: '1iE 30</span></td><td class="largeCol printUpscaleFontFornavn" lectioContextCard="S10126130423">     <span class="noWrap">       <a id="s_m_Content_Content_laerereleverpanel_alm_gv_ctl02_lnk1" href="/lectio/71/SkemaNy.aspx?type=elev&amp;elevid=10126130423">Alexander Ulbæch</a>          </span>           </td><td class="largeCol" lectioContextCard="S10126130423"><span class="noWrap">Dupont</span></td><td class="nowrap"><span'
  var regExp = /[a-zA-ZæøåÆØÅ0-9][a-zA-ZæøåÆØÅ0-9]E?F?G? [0-9][0-9]?<\/span><\/td>/g;
               /*
               _2 x (class designation: danish letter or digit)_
               _optional E
               _optional F_
               _optional G_
               _space_
               _1-2 digit number_
               _</span></td><td class="largeCol printUpscaleFontFornavn_
               */
  //console.log(html.split(regExp));
  sNames = html.split(regExp);
  sNames.shift(); //drop stuff before first match
  for (var n = 0; n < sNames.length; n++) {
    sNames[n] = studentNameFromHTML(sNames[n]);
  }
  return sNames;
};

var studentNameFromHTML = function(html) {
  var sName = html.substring(0, html.search('</span></td><td class="nowrap">')); //cut off everything after the last name
  //sName = sName.substring(sName.search('>'), sName.length); //cut off everything before a > (remove half-html> tags leftover from regexp search)
  sName = sName.replace(/(<([^>]+)>)/ig,""); //remove all html <tags>
  sName = htmlDecode(sName); //decode html-chars such as &aring;
  sName = sName.replace(/\r?\n|\r/g," "); //replace newlines with spaces
  sName = sName.replace(/[ \t\r]+/g," "); //remove extra whitespace, tabs etc
  //change middle names to initials
  var names = sName.split(" ");
  names.shift(); //remove first empty space name
  var midNames = 0;
  for (var n = 1; n < names.length - 1; n++) {
    names[n] = names[n].charAt(0);
    midNames = n;
  }
  sName = names[0]; 
  for (var m = 0; m < midNames; m++) {
    sName += " " + names[m+1] + ".";
  }
  sName += " " + names[m+1];
  return sName;
};