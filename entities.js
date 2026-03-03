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
}
export { Bird, Wall };