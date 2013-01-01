require 'rest_client'
require 'json'

def getCall(uri,key,value,level)
  response = RestClient.get 'https://api.zunefit.com:444' + uri
  parseReturn(response,key,value,level)
end

def postCall(uri,key,value,level,body)
  response = RestClient.post 'https://api.zunefit.com:444' + uri, body, :content_type => :json, :accept => :json, :ltype => :web, :token => :'ED7ULbqzB8M1sfssnBFmDE7sSG9Gb95MlSsDM_bX9QkRtjnM5GzVd2G-yib42Sp'
  parseReturn(response,key,value,level)
end




def parseReturn(input,key,value,level)
  if level == 0
  	print input
  	if JSON.parse(input)[key] == value
  	  print "success"
  	else
  	  print "failed"
  	end
  elsif level == 1
    JSON.parse(input).each do |r|
  	  if r[key] == value
  		print "success"
  	  else
  		print "failed"
  	  end
    end
  end
end


getCall('/api/gymInfo/22','name','KennedyFitness',1)

postCall('/api/addEvent/','status','success',0,'{ "gymid": "22","classid": "2", "datetime": "2012-12-18 06:05:55" }')

