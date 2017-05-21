function Brush(rune)
{
  Module.call(this,rune);
  
  this.parameters = [];
  this.settings  = {"color":"#ffffff","size":2};
  this.pointers = [new Pointer(new Position("0,0"))];

  this.add_method(new Method("add_pointer",["Position"]));

  this.add_pointer = function(params, preview = false)
  {
    if(preview){ return; }

    var pointer = new Pointer();
    pointer.offset = params.position() ? params.position() : new Position("0,0");
    this.pointers.push(pointer);

    ronin.terminal.log(new Log(this,"Added pointer at: "+pointer.offset.render()));
    
    return 1, "ok";
  }
  
  this.passive = function(cmd)
  {
    if(cmd.rect()){
      var x = isNaN(cmd.rect().width) ? 0 : cmd.rect().width;
      var y = isNaN(cmd.rect().height) ? 0 : cmd.rect().height;
      var pos = new Position(x+","+y);
      ronin.overlay.draw(pos);
    }
    if(cmd.angle() && cmd.position()){
      ronin.overlay.draw(cmd.position());
    }
  }

  this.size_up = function()
  {
    this.settings["size"] -= this.settings["size"] > 1 ? 1 : 0;
    ronin.frame.widget.update();
    ronin.terminal.log(new Log(this,"Increased pointer size to: "+this.settings["size"]));
  }

  this.size_down = function()
  {
    this.settings["size"] += 1;
    ronin.frame.widget.update();
    ronin.terminal.log(new Log(this,"Decreased pointer size to: "+this.settings["size"]));
  }

  // Eraser

  this.erase = function()
  {
    if(!this.position_prev){this.position_prev = ronin.cursor.position; }
    
    var position = ronin.cursor.position;
    
    ronin.frame.context().beginPath();
    ronin.frame.context().globalCompositeOperation="destination-out";
    ronin.frame.context().moveTo(this.position_prev.x,this.position_prev.y);
    ronin.frame.context().lineTo(position.x,position.y);
    ronin.frame.context().lineCap="round";
    ronin.frame.context().lineWidth = this.settings["size"] * 5;
    ronin.frame.context().strokeStyle = new Color("#ff0000").rgba();
    ronin.frame.context().stroke();
    ronin.frame.context().closePath();
    
    this.position_prev = position;
  }
  
  // Mouse

  this.mouse_pointer = function(position)
  {
    return ronin.cursor.draw_pointer_circle(position,this.settings["size"]);
  }
  
  this.mouse_mode = function()
  {
    if(keyboard.shift_held == true){
      return "Eraser "+this.settings["size"];
    }
    else{
      return "Brush <i style='color:"+this.settings["color"]+"'>&#9679;</i> "+this.settings["size"];  
    }
  }
  
  this.mouse_down = function(position)
  {
    if(position.is_outside()){ return; }

    if(keyboard.shift_held == true){
      this.erase();
    }
    else{
      for (i = 0; i < ronin.brush.pointers.length; i++) {
        ronin.brush.pointers[i].start();
      }
    }
  }
  
  this.mouse_move = function(position,rect)
  {
    if(!this.mouse_held){ return; }
    
    if(keyboard.shift_held == true){
      this.erase();
    }
    else{
      for (i = 0; i < ronin.brush.pointers.length; i++) {
        ronin.brush.pointers[i].draw();
      }
    }
  }
  
  this.mouse_up = function(position,rect)
  {    
    for (i = 0; i < ronin.brush.pointers.length; i++) {
      ronin.brush.pointers[i].stop();
    }
  }

  this.widget = function()
  {
    var s = "<i style='color:"+this.settings["color"]+"'>&#9679;</i> Brush "+ronin.brush.pointers.length+"x "+this.settings["size"]+"<br />";  

    for(id in this.pointers){
      s += this.pointers[id].widget();
    }
    return s;

  }
}