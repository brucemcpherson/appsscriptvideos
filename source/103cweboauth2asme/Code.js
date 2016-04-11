

function oneOffSetting() { 
  
  // used by all using this script
  var propertyStore = PropertiesService.getScriptProperties();
  cGoa.GoaApp.setPackage (
    propertyStore , 
    cGoa.GoaApp.createPackageFromFile (DriveApp , {
      packageName: 'cloudvision',
      fileId:'0B92ExLh4POiZTWdUWUxPRzAxYlE',
      scopes : cGoa.GoaApp.scopesGoogleExpand (['cloud-platform']),
      service:'google'
    }));
  
}




// this is pattern for a WebApp.
// passing the doGet parameters (or anything else)
// will ensure they are preservered during the multiple oauth2 processes
function doGet(e) {     
  
  // get the goa for this project
  var goa = cGoa.GoaApp.createGoa(
    'cloudvision', 
    PropertiesService.getScriptProperties()
  ).execute(e);
  
  // it's possible that we need consent
  // this will cause a consent dialog
  if (goa.needsConsent()) {
    return goa.getConsent();
  }

  // if we get here its time for your webapp to run 
  // and we should have a token, or thrown an error somewhere
  if (!goa.hasToken()) { 
    throw 'something went wrong with goa - did you check if consent was needed?';
  }

  // now return the evaluated page
  return HtmlService
  .createTemplateFromFile('index')
  .evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)
  .setTitle('Web app Oauth2 as me')
  
} 


function getData () {
  
  // get the goa for this project
  var goa = cGoa.GoaApp.createGoa(
    'cloudvision', 
    PropertiesService.getScriptProperties()
  ).execute();
  
  // check we have one
  if (!goa.hasToken()) {
    throw 'should have been a token';
  }
  
  // use it
  var endPoint = "https://vision.googleapis.com/v1/images:annotate";
  
  // get an image
  var image = DriveApp.getFileById("0B92ExLh4POiZV2QzQVEzUTRIOWc");
  var b64 = Utilities.base64Encode(image.getBlob().getBytes());
  // encode it into a query
  var body = { 
    requests: [{
      features: [{
        "type":"LABEL_DETECTION",
        "maxResults":5
      }],
      image: { 
        content: b64
      }
    }]
  };
  
  // send it to cloud vision, using the access token
  var response = UrlFetchApp.fetch ( endPoint, {
    method: "POST",
    payload: JSON.stringify(body),
    contentType: "application/json",
    headers: {
      Authorization:'Bearer ' + goa.getToken()
    }
  });
  
  // return the result for rendering
  return {
    data:JSON.parse(response.getContentText()),
    file:{
      type:image.getMimeType(),
      b64:b64
    }
  }
  
}

