class Bird{
    constructor({position, radius, flyForce}){
        this.radius = radius;
        this.color = "red";
        this.position = position;
        this.flyForce = flyForce;
        this.velocity = 0;
        this.score = 0;
    }
}

class Wall {
    constructor({position, size}){
        this.position = position;
        this.size = size;
        this.color = "green";
        this.hasPassed = false;
    }
    get left (){
        return this.position.x;
    }
    get right (){
        return this.position.x + this.size.width;
    }
    get top (){
        return this.position.y;
    }
    get bottom (){
        return this.position.y + this.size.height;
    }
}
export { Bird, Wall };