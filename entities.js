class Bird{
    constructor({position, radius}){
        this.radius = radius;
        this.color = "red";
        this.position = position;
        this.flyForce = -350;
        this.velocity = 0;
    }
}

class Wall {
    constructor({position, size}){
        this.position = position;
        this.size = size;
        this.color = "green";
    }
    get left (){
        return this.position.x;
    }
    get right (){
        return this.position.x + this.size.Width;
    }
    get top (){
        return this.position.y;
    }
    get bottom (){
        return this.position.y + this.size.height;
    }
}
export { Bird, Wall };