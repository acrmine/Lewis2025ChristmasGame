enum ActionKind {
    Walking,
    Idle,
    Jumping
}
function handlePlayerMovement () {
    playerRobot.ay = gravity
    if (controller.B.isPressed() && playerRobot.isHittingTile(CollisionDirection.Bottom)) {
        playerRobot.vy = jumpPower
    }
    // Apply motion based on left right button being pressed, move faster when going in the opposite direction for quick turn around
    if (controller.dx() / Math.abs(controller.dx()) != playerRobot.vx / Math.abs(playerRobot.vx)) {
        playerRobot.vx += controller.dx() * (speedScalar * 5)
    } else {
        playerRobot.vx += controller.dx() * speedScalar
    }
    // Apply linear damping to slow down player
    if (Math.abs(playerRobot.vx) > maxSpeed || !(controller.anyButton.isPressed())) {
        if (playerRobot.vx > 0) {
            playerRobot.vx = Math.max(playerRobot.vx - linearDamping, 0)
        } else if (playerRobot.vx < 0) {
            playerRobot.vx = Math.min(playerRobot.vx + linearDamping, 0)
        } else {
        	
        }
    }
}
function assemblePlayerAnims (mySprite: Sprite) {
    customUtils.setDataImageArray(mySprite, "playerIdle", [
    ])
}
function assignPlayerAnims (mySprite: Sprite) {
    characterAnimations.loopFrames(
    mySprite,
    customUtils.readDataImageArray(mySprite, "playerIdle"),
    200,
    characterAnimations.rule(Predicate.NotMoving)
    )
}
let playerRobot: Sprite = null
let jumpPower = 0
let gravity = 0
let maxSpeed = 0
let speedScalar = 0
let linearDamping = 0
linearDamping = 12
speedScalar = 2
maxSpeed = 100
gravity = 400
jumpPower = -170
let testLevel = tiles.createMap(tilemap`level1`)
tiles.loadMap(testLevel)
playerRobot = sprites.create(assets.image`orange_robot_idle_0`, SpriteKind.Player)
scene.cameraFollowSprite(playerRobot)
assemblePlayerAnims(playerRobot)
assignPlayerAnims(playerRobot)
game.onUpdate(function () {
    handlePlayerMovement()
})
