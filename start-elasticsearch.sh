DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

elastic_dir=$DIR/elasticsearch-0.90.3
if ! [ -e $elastic_dir ];then
  wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.3.zip
  unzip elasticsearch-0.90.3.zip
  rm elasticsearch-0.90.3.zip
fi

$DIR/elasticsearch-0.90.3/bin/elasticsearch -f
