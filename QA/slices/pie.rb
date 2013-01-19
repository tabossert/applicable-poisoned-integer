require 'rest_client'
require 'json'

token = 'ngJoqKu4NLMjnQUA7bMEnY_aSLt8paO_gw3ukVmy9MDnPrj2J2o-Esse7iw4WbHM'

def getCall(uri,key,value,level)
  response = RestClient.get 'https://api.zunefit.com' + uri
  returnCode(response,key,value,level)
end

def postCall(uri,key,value,level,body,token = '')
  response = RestClient.post 'https://api.zunefit.com' + uri, body, :content_type => :json, :accept => :json, :ltype => :web, :token => token
  ret = returnCode(response,key,value,level)
  return ret
end

def deleteCall(uri,key,value,level,body,token = '')
  response = RestClient.delete 'https://api.zunefit.com' + uri, body, :content_type => :json, :accept => :json, :ltype => :web, :token => token
  ret = returnCode(response,key,value,level)
  return ret
end



def returnCode(input,key,value,level)
  if level == 0
  	print input
  	if JSON.parse(input)[key] == value
  	  return input
  	else
  	  print "failed"
  	end
  elsif level == 1
    JSON.parse(input).each do |r|
  	  if r[key] == value
        return input
  	  else
        print "failed"
  	  end
    end
  end
end


def parseReturn(level,response,key)
  if level == 0
    return JSON.parse(response)[key]
  elsif level == 1
    JSON.parse(response).each do |r|
      return r[key]
    end
  end
end

#getCall('/api/gymInfo/22','name','KennedyFitness',1)

#postCall('/api/addEvent/','status','success',0,'{ "gymid": "22","classid": "2", "datetime": "2012-12-18 06:05:55" }')


def gymSearch()
  gymSearchRet = postCall('/api/gymSearchAdvanced/','name','Srilanka',1,'{"address": "94596", "maxDistance": "5","rate": 100, "workouts": "karate,yoga"}') 
  return gymSearchRet
end

def gymClasses()
  gymClassesRet = getCall('/api/getClasses/' + '22','gymid',22,1)
  return gymClassesRet
end

def addEvent(token,gymid,classid,datetime)
  addClassRet = postCall('/api/addEvent/','status','success',0,'{"gymid": "' + gymid + '","classid": "' + classid + '", "datetime": "' + datetime + '"}',token)
  return addClassRet
end

def deleteEvent(token,classid)
  print '{"classid": ' + classid.to_s() + '}'
  deleteClassRet = deleteCall('/api/deleteEvent/','status','success',0,'{"sid": ' + classid.to_s() + '}',token)
  return deleteClassRet
end

a = gymSearch()
print a
b = gymClasses()
print b
c = addEvent(token,'22','21','2013-02-25 14:00:00')
d = parseReturn(0,c,'sid')
print d
e = deleteEvent(token,d)
print e

#def classFlow()



# add class flow
#   gym search by class/distance -> get gym id -> get gym classes -> schedule class -> delete class
# 


