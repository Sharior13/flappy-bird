class Bird{
    constructor({position, radius}){
        this.radius = radius;
        this.color = "red";
        this.position = position;
        this.flyForce = 20;
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