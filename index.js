let model;

async function loadModel() {
  try {
    model = await tf.loadLayersModel('localstorage://my-model');
    model.summary();
    console.log("Model loaded");
    /*const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });*/
    console.log("Model compiled");
  }catch(error){
    console.log(error);
  }
}

$(document).ready(
  function(){
    loadModel();
    var clic=false;
    var xCoord,yCoord="";
    var canvas=document.getElementById("can");
    var cntx=canvas.getContext("2d");
    cntx.strokeStyle="white";
    cntx.lineWidth=15;
    cntx.lineCap="round";
    cntx.fillStyle="#000";
    cntx.fillRect(0,0,canvas.width,canvas.height);

    var nn_canvas = document.getElementById("nn_can");
    var nn_cntx=nn_canvas.getContext("2d");
    nn_cntx.fillStyle="#000";
    nn_cntx.fillRect(0,0,nn_canvas.width,nn_canvas.height);

    $("#can").mousedown(
    function(canvas){
      clic=true;
      cntx.save();
      xCoord=canvas.pageX-this.offsetLeft;
      yCoord=canvas.pageY-this.offsetTop
    });

    $(document).mouseup(function(){
      clic=false
    });

    $(document).click(function(){
      clic=false
    });

    $("#can").mousemove(
      function(canvas){
        if(clic==true){
          cntx.beginPath();
          cntx.moveTo(canvas.pageX-this.offsetLeft,canvas.pageY-this.offsetTop);
          cntx.lineTo(xCoord,yCoord);
          cntx.stroke();
          cntx.closePath();
          xCoord=canvas.pageX-this.offsetLeft;
          yCoord=canvas.pageY-this.offsetTop
        }
      }
    );

    $("#clr > div").click(
      function(){
        cntx.strokeStyle=$(this).css("background-color");
      }
    );

    $("#clean").click(
      function(){
        cntx.fillStyle="#000";
        cntx.fillRect(0,0,canvas.width, canvas.height);
        cntx.strokeStyle="white";
        cntx.fillStyle="white";
        nn_cntx.drawImage(canvas,0,0,280,280,0,0,28,28);
        document.getElementById('answer').innerHTML='';
      }
    );

    $("#read").click(
      function() {
        var img = cntx.getImageData(0, 0, canvas.width,canvas.height);
        var data = img.data;

        nn_cntx.drawImage(canvas,0,0,canvas.width,canvas.height,0,0,nn_canvas.width,nn_canvas.height);
        var resized_img = nn_cntx.getImageData(0,0,nn_canvas.width,nn_canvas.height);

        var nn_data = [];
        var index = 0;
        for (var row=0; row<28;row++) {
          var temp_row = [];
          for (var col=0; col<28;col++) {
            resized_img.data[index] ? temp_row.push(1) : temp_row.push(0);
            index += 4;
          }
          nn_data.push(temp_row);
        }
        var tf_data = tf.tensor(nn_data);
        tf_data = tf_data.reshape([1,28,28,1]);
        // model.predict(tf_data).argMax([-1]).print();
        const preds_dict = model.predict(tf_data).argMax([-1]);
        // preds_dict.array().then(prediction => console.log(prediction));
        preds_dict.array().then(prediction => document.getElementById('answer').innerHTML=prediction);
      }
    )
  }
)
