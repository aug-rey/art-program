/*

Credits to the CodeHS JavaScript Library for the classes Circle, Line, and Keyboard, and the functions add, remove, setFullscreen, mouseMoveMethod, mouseDownMethod, print, and setTimer.

https://codehs.github.io/chs-js-lib/docs/

*/

setFullscreen();


var colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.style.position = "absolute";
colorPicker.style.top = "5px";
colorPicker.style.left = "5px";
colorPicker.style.borderWidth = "0px";
colorPicker.style.backgroundColor = "transparent";
document.body.insertBefore(colorPicker, document.getElementById("js-eval-frame"));

var primaryColor = "#000000";
var altColor = "#FFFFFF";
var savedColors = ["#FFC0CB", "#000000", "#A9A9A9", "#808080", "#FF0000", "#FFA500", "#FFFF00", "#00FF00", "#0000FF", "#FF00FF"];

var brush = new Circle(4);
brush.setPosition(0, 0);
brush.setColor(primaryColor);
add(brush);

var mouseDown = -1;

var lastCircleX = null;
var lastCircleY = null;
var currentCircles = [];
var currentConnectors = [];
var circleGroups = [];
var connectorGroups = [];

var currentLine = 0;

print(`Instructions:
• use left click to draw
• use right click to erase
• scroll up to increase the brush size
• scroll down to decrease the brush size
• use the "Z" key to undo
• use the "Y" key to redo
• use the "R" key to clear the screen
• use the rectangle in the top left to choose the color
• use shift + any number to save a color
• press the number to load the saved color`);

function undoRedo(group, undo)
{
    if (!((undo && group + 1 > 0) || (!undo && group < connectorGroups.length)))
    {
        return;
    }
    for (var i = 0; i < connectorGroups[group].length; i++)
    {
        if (undo)
        {
            remove(connectorGroups[group][i]);
        }
        else
        {
            add(connectorGroups[group][i]);
        }
    }
    for (var i = 0; i < circleGroups[group].length; i++)
    {
        if (undo)
        {
            remove(circleGroups[group][i]);
        }
        else
        {
            add(circleGroups[group][i]);
        }
    }
    if (undo)
    {
        currentLine--;
    }
    else
    {
        currentLine++;
    }
}

function colorPickerChangeEvent(event)
{
    brush.setColor(event.target.value);
    primaryColor = event.target.value;
}

function mouseMoveEvent(event)
{
    brush.setPosition(event.getX(), event.getY());
}

function scrollEvent(event)
{
    if (event.deltaY > 0)
    {
        brush.setRadius(brush.getRadius() / 1.2);
        if (brush.getRadius() < 1)
        {
            brush.setRadius(1);
        }
    }
    else if (event.deltaY < 0)
    {
        brush.setRadius(brush.getRadius() * 1.2);
        if (brush.getRadius() > (getWidth() ** 2 + getHeight() ** 2) ** 0.5)
        {
            brush.setRadius((getWidth() ** 2 + getHeight() ** 2) ** 0.5);
        }
    }
}

function mouseDownEvent(event)
{
    colorPicker.style.display = "none";
    switch (event.button)
    {
        case 0:
            brush.setColor(primaryColor);
            break;
        case 2:
            brush.setColor(altColor);
            break;
        default:
            return false;
    }
    mouseDown = event.button;
}

function mouseUpEvent(event)
{
    colorPicker.style.display = "block";
    mouseDown = -1;
    lastCircleX = null;
    lastCircleY = null;


    var newConnectorGroups = [];
    var newCircleGroups = [];
    for (var i = 0; i < currentLine; i++)
    {
        newConnectorGroups.push(connectorGroups[i]);
    }
    for (var i = 0; i < currentLine; i++)
    {
        newCircleGroups.push(circleGroups[i]);
    }

    connectorGroups = newConnectorGroups;
    circleGroups = newCircleGroups;

    if (currentCircles.length > 0)
    {
        circleGroups.push(currentCircles);
        connectorGroups.push(currentConnectors);
        currentLine++;
    }
    currentCircles = [];
    currentConnectors = [];
}

function keyDownEvent(event)
{
    for (var i = 0; i < savedColors.length; i++)
    {
        if (event.keyCode == Keyboard.digit(i))
        {
            if (isKeyPressed(Keyboard.SHIFT))
            {
                savedColors[i] = brush.getColor();
            }
            else
            {
                brush.setColor(savedColors[i]);
                primaryColor = savedColors[i];
                colorPicker.value = savedColors[i];
            }
            return true;
        }
    }
    switch (event.keyCode)
    {
        case Keyboard.letter("r"):
            for (var i = currentLine; i > 0; i--)
            {
                undoRedo(currentLine - 1, true);
            }
            break;
        case Keyboard.letter("z"):
            undoRedo(currentLine - 1, true);
            break;
        case Keyboard.letter("y"):
            undoRedo(currentLine, false);
            break;
    }
}

function mainLoop(event)
{
    if (mouseDown != -1)
    {
        var x = brush.getX();
        var y = brush.getY();
        var radius = brush.getRadius();
        if (mouseDown == 0)
        {
            var color = primaryColor;
        }
        else
        {
            var color = altColor;
        }
        var clone = new Circle(radius);
        clone.setPosition(x, y)
        clone.setColor(color);
        currentCircles.push(clone);
        add(clone);
        if (lastCircleX != null)
        {
            var connector = new Line(lastCircleX, lastCircleY, x, y);
            connector.setLineWidth(radius * 2);
            connector.setColor(color);
            currentConnectors.push(connector);
            add(connector)
        }
        lastCircleX = x;
        lastCircleY = y;
        remove(brush)
        add(brush)
    }
}

window.addEventListener("contextmenu", e => e.preventDefault());
colorPicker.addEventListener("change", colorPickerChangeEvent);
mouseMoveMethod(mouseMoveEvent);
window.addEventListener("wheel", scrollEvent);
mouseDownMethod(mouseDownEvent);
window.addEventListener("mouseup", mouseUpEvent);
keyDownMethod(keyDownEvent);
setTimer(mainLoop, 1);
