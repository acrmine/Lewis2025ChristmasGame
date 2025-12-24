enum ActionKind {
    Walking,
    Idle,
    Jumping
}
function handlePlayerMovement () {
    playerRobot.vx += controller.dx()
}
function assemblePlayerAnims (mySprite: Sprite) {
    customUtils.setDataImageArray(mySprite, "playerIdle", [
    assets.image`orange_robot_idle_0`,
    assets.image`orange_robot_idle_1`,
    assets.image`orange_robot_idle_2`,
    assets.image`orange_robot_idle_3`,
    assets.image`orange_robot_idle_4`
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
let linearDamping = 1
let testLevel = tiles.createMap(tilemap`level1`)
tiles.loadMap(testLevel)
playerRobot = sprites.create(assets.image`orange_robot_idle_0`, SpriteKind.Player)
scene.cameraFollowSprite(playerRobot)
assemblePlayerAnims(playerRobot)
assignPlayerAnims(playerRobot)
game.onUpdate(function () {
    handlePlayerMovement()
})
