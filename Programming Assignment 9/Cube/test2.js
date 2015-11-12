/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the cube is more complicated since it is designed to allow making many cubes

 we make a constructor function that will make instances of cubes - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all cubes - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each cube instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Cube = undefined;
var SpinningCube = undefined;
var pImage2;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Cube = function Cube(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [1.0,0.0,0.0];
    }
	function wait(ms){
       var start = new Date().getTime();
       var end = start;
       while(end < start + ms) {
         end = new Date().getTime();
      }
    }
    
    var setUpTexture = function(gl)
    {

        var texture1 = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        pImage2 = new Image();
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture1;
    }


    function initTexture(texture, gl)
    {

      pImage2.onload = function() { loadTexture(pImage2,texture, gl); };
      pImage2.crossOrigin = "anonymous";
	  pImage2.src ="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAB8WSURBVHhe7d1dmtzIjQXQXsg8zv53NnsY2XKrZdVPMpiXDAA8/ubFbhJEnAsis1Qa+6+//IsAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIErhL4v//539X/u6oVdQkQIEDgUoHVdX/k+ksbVpwAAQIETgoc2eDZa0426rYHCJybtAfAOCKBqMC5Ny17V/RAivUTyI7T79X6WeiYwA0C171y71S+4eAeUUTgnTk5d2+Rg2uDwDaBc2/Oz7tWm77zWau9uX6LwDsjkb13y/E9lMA2gdX354pGK/RwxbnU/F5gNfc7r5cdgckCS+/SnRBlG7sTYfazliL+ePEJnHeeeOJxbiFQV+D4y7D9DAdb3d6nBg4KHAz06t/WFmnjIJrLCMQEjox+7GGhQh17Dh19SJkjCf665v4zF2/vfhBPHCjwcsrrn3nAEeojZzt8GdnGvf/pSQ82nFVSjcCFAi9n+sJnX1B62HEuECpR8mVM5/4K2T1na938PUSe0kPg+1HucYYvuhx8tMG5VN77H9mPfBK0DkvzYwWesB+fcMZeA/pyY/Y6zs9uRx6qYxB6PirwzcgeLdHnOh8DFbJ6QgpPOGOFWdLDeYFHrf7fmR578POzkrvzUZvRpOUGR6WowMNH8+HHj47S0WKPWv2/UJ556qMz4botAl8N5ZZmNj6Uw234D//EffjxbxszD3ohYBD/AAJy9TtD+MhPA1enoD6BL/+KAho/Clw0A7a/LxwXjZayawJ23PdefNbm6cDVSL9CInNgfFySEzBwRywpHVE6co0v/u8oHbnXNQSOCnz6Nh69+XnX4Xozc5+jxwFZHbdy5RkB6+yEGrQTaD9vsdFW6Yitirn+qIBFdlTqw3XoTtDZZSfQfGqeQ3PXCwEr7M0RAbgEiGuJ6+PFAN8EdPs/AoYpMg0YDzKCOgj1/WUYI4xPL2KMghMA8yUmopdExy+AedzKlZ8IGKD4WCD9hhSOeYsLKHhSwNt4Eu7VbWA/FcLyanBO/nOwJ+EeftvHuXk4SPD4bP/AtKSC0/WxFN5LeQcWt6GuDpXwL2Hr6eph+1Ef8g3IQx5hN90TJOefzhzM2z0CnvJawDeF10ahK1Db/qFROlrGZ+1RqWdeZyXdnPvDwe2jm+fNJ+794J2e6IW8P63Hmj/8w+/+SfvqD9x+BLGrGc8tJPDYTbQ9gwfK2/4bpw7+Rvyij37gDiqVxNP8n3beUsPmD4KqxbG/Hy/k3gwe5f+ow+6dq2+eLoWy0dzdmFG4W/yz5z0khYccs8JEvexBFi+J5l9gCOpk/IQsnnDGOhP1fSd+GdAlqQv79EJeiLtYenwW4w+4GPj+yyWyP4ONHYh/I/6njx6cyOCjVZuipX7kssQ16uI/sh91traHmRrK1HO1HbR/GhfNgBCXj+CTf5nslhtG5jLyULeMwx0Pkc4dytWe4WO/WiK/+pkXzbwTlR2ec435DDjn1vUueVdOblg6w45TeXJO9yaj03Qtb/SNrHhsY17IMQcpPjDvtyep9w17VJB0/ZzGZDTmIPVn5v0OfS9837BBBTE3CGnE/1KK7d9i0r765dOP+Hr1r9vXAt7J10Y1rhiQlK8aNUZpoQuRLWB1vFTAjVJrHdaAD7BGo5JqVWopyYp1pFsxla97ap1X60+vXnOS7VZwWc9C1URbKIxjrTSNrPVH17Fkxl4lu5nRyrVjrk1Ta/q51XFCruhZfFeobq4p1M0BnH18x+A69nw2n4H3Nf3aMTCJ4JG8k0HMO0u1C876uHM8LnpWu6m7yGFIWe9k6yB7vY29um09GNc1L8TrbDdUFucG9NwjG8Xnq0Yu9p2V5LhTP/7sRhskfvYBBRvF16jVAYNx6RFEeSnvfcV9mN9nfdmTuryNXfq8LKg5hUU5JEtBDgiyRYi+agyYtN+P0GLqhpnnjyPFvOntFVuE2KLJ26Nr/ECBNg7vZ+u+lLWP8O8D1H8b63c4ZhjuOYhA73G+8CkivBD33tLFoyze3r1ZzXmaWHtnKb/e+f3WffEoi7c3ZgxuPohYbwZPPs6f/yQ1d9cqnqZNsXtALnm+WC9hvaeo8O5xvu0pZQMt/uF0W0AjH1R26kZqJw8luaRmgVplAy3bWIHQ2rcg3K4RSq5rcl/0XTbQso0NG4AtxxHuFvbAQyUXQKxUouyftJi0SmMS7kW4YdB7yontHuebn1Iw1rIfSzdHM/hxBadusHbmaDLLOBarUjDWgi0VC619OyLuF6HM+mV2oOOCsRZs6QCkSxYERLyAVeRSmRUJIttGwVgLtpQ1V03E/WZAZv0yO9ZxtWSr9XNM0VULAiJewKpwqcAqpHBRD6XCLdXMReDK/hAQdKcxkFantBZ7LRVuqWYWIV2+ICDoBaztl0prewTXNVAq3FLNXGeusqA7zYC0OqW12GupcEs1swjp8gUBQS9gbb9UWtsjuK6BUuGWauY6c5UF3WkGpNUprcVeS4VbqplFSJcvCAh6AWv7pdLaHsF1DZQKt1Qz15mrLOg2MyCqNlGdbbRIxEXaOKvovjUBca957bpaTrvkb3tukYiLtHEb+8MfJO4eAyCnHjm90WWRiIu08QakWxcExL2AtfFSOW3Ev+fRRSIu0sY95p4i7h4zIKceOb3RZZGIi7TxBqRbFwTEvYC18VI5bcS/59FFIi7Sxj3mniLuHjMgpx45vdFlkYiLtPEGpFsXBMS9gLXxUjltxL/n0UUiLtLGPeaeIu4eMyCnHjm90WWRiIu08QakWxcExL2AtfFSOW3Ev+fRRSIu0sY95p4i7h4zIKceOb3RZZGIi7TxBqRbFwTEvYC18VI5bcS/59FFIi7Sxj3mniLuHjMgpx45vdFlkYiLtPEGpFsXBMS9gLXxUjltxL/n0UUiLtLGPeaeIu4eMyCnHjm90WWRiIu08QakWxcExL2AtfFSOW3Ev+fRRSIu0sY95p4i7h4zIKceOb3RZZGIi7TxBqRbFwTEvYC18VI5bcS/59FFIi7Sxj3mniLuHjMgpx45vdFlkYiLtPEGpFsXBMS9gLX3UlHt9b/66b/ne/Wzvq9v0vb63/Z0Qd9GHXiQtAKIVUuUCrdUM1UTm9CXoDulKK1OaS32WircUs0sQrp8QUDQC1jbL5XW9giua6BUuKWauc5cZUF3mgFpdUprsddS4ZZqZhHS5QsCgl7A2n6ptLZHcF0DpcIt1cx15ioLutMMSKtTWou9lgq3VDOLkC5fEBD0AlaFS+v8TcEKGpN6qPYqVutnUtZFziLiIkEstCGzBaw+lxaMtWBLffLs0amIe+T0e5cy65fZgY4LxlqwpQOQLlkQEPECVpFLZVYkiGwbBWMt2FLWXDUR95sBmfXL7EDHBWP9o6Uf//bAOVzSSaDg1HXi29Kr13IL+6UPLZupBXFp7nuLC3ev//mnS+68Xck7ywZatrGSMTZrSrjNAvvVruS6JvdF32UDLdvYsAHYchzhbmEPPFRyAcRKJcoGWraxSul17UW4Q5Lz27muQf7dd+VXsXJv3XPf2L9YN+IHHi2/AGKNEsWjLN5ejQz7dSHWfpn93rH8euf3W/fFoyze3pgxuPkgYr0ZPPy4sn9xMHzOB5Sr/yrW7/ABY5I8okCTmrtqSXGXfPC5LUJs0WQwlPGlBDohYikOSLFFiH7cHDBp/gB5WIh/tdgd09DT5+kSYpc+0/kMrCfKOaHKsnWWjb5Zm7TWk+br/5j4/usgXsvWuTaKr9FnVeuRuLp5OV4tfGt9cd7KnX5Yow+AH0fv1W06qyH1hDgkyF/HkGjTRNt9eLdruOlgXNq2dXEp74biEt2Annhkx+A69pzIakgNH+FDgvzmVzo/Mh54yHFHavoq+gBoPYniax3fl83LtV2uTSNr+rnVbjyuaFh2V6iWqCnaEjEcbqJ1Xk0/ug6HM/ZCwY2N1t/Q6BVt61ex9adXrzkJdiu1IGbFUgKumMoXPbX+APBto9Gk/Wq1+8h1NL+7ZxnfLX7qeQM+qgcc4VR0XW+SV9fklvoW8xLXlovHZOTbxpb5OfdQYZ1z63eXpItnNvUDwF8+Ljt4Y0aurHChxoRdKIwPrQxLZ9hxKk/O6d5kdJqu641+CCib3LBoLJeyk/bV7379oFY/snc79Fq+K3jN/SNzGXmoa/LfUFU6G9ArPHLYN80KpO/3MDWUqed6P/HtFUSzPYI9Dfjk3+P+9VMHJzL4aNWmaKkfuSxxTbtY/HUSHZ/F+APWmaWDnUjkINTYy0xAnWifkMUTzlhnol52Io6XRPMvMAQVMn5ICg85ZoWJetmDLF4SPeUCo7A36Uf5P+qwe+fqm6dLoWw0GxozDRvQf3vk0/yfdt690/Xx6fyrJbK/HzOxK4MHyn888o//ZJf/054L/2mJHz3vAzfRUZrLrnus+WMPftkoHS1M/qjU067z1eDmxB8ObhPdPG8/Hsf8fvNOT3z4Sro5Km8jgTtHjvad2l2fZUruSY7zp19I/TLgovHz3e4i2IFl7aarQyX8S9hiunrYfNDeIDzqEd7JS+PE+wcvEPN2qYDiywLeyWWyYzeA/dQJy7HxWb4K7DKZG34KGJ34JCD9hhSOeYsLKPiWgHfyLb7/vhnmS0xEL4mOXwDzuJUrvxQwRpHhwHiQEdRBqO8vwxhhVMSfBQVmwNu4hIhrievjxQDfBHT7nwJG6vRMoDtB9yma/xeBl5LcXhK54KSARXYCDtoJtJ+32GWrdMRWxVy/JmCdLXnhWuI6+EcZfg74VNX2f3PY3H5IwJwdYvKXaA8yvbrMvL0S8tPSESHX5AS8k99b8snN2n8qIf2KlEx82BR8LWDsvJCvpyR6hZHzR2TRgVLsPYGvXsgn/xGtJfXeTL2428j9AkJx6aQpflTAyvsp5YU8OjHvXfeN80O+eRB4b4LcnRbwGUAgPVN+FPhcwPeMmyfN4w4JPHYuH3vwQ2Nx5UVP+yL8tPNeOTtqXyDwtAF92nkvGJlAySek8IQzBkZBiQoCTxjWJ5yxwiwd72FqIlPPdTxZV/YT+H5qu/+mzjtZcyJfTl2jwZt0lprToqvLBV4O8eUdpB9g9adF8/VeTl3xj4Hu/ecTVbG1wMuBrn+6Fkd42eTpC+oH9LHDg4etc7R2Ddeh00l1gSPDXfMMjTo/0uq5a2pGc6SrpfMeKZi9pnh72cOq9nSBg+NegalRq7+4DvZ84rIKibzTQ6kjl2rmHVX3EjgjsPQCnHnA2XvKNnbwQEv9L118sIH6ly2d+o+Lz53u/iee69NdBG4VOPFiXNFfkTYiRztxloO3RNorVeTgwXddVspKMwQuFDj9jp3r6ebHnWvy3F2Rb6w/Hx0sde4st911eh7iN952ZA8iUE4g/joFC5bD+qKh4NYOlmqqF5yf70t18dEngZsEbnv3hr2Zwa0dLHXT0KQfc90QpjtVj8BQgetewq8qt4YMbu1gqdakvzd/bhrHHN9BCOwUOPf6Hblr56mizw5u7WCp6BEVI0CAwL8Fjiz3j9cMxgtu7WCpweCORoAAgSoCwa0dLFVFRx8ECBAYLBDc2sFSg8EdjQABAlUEgls7WKqKjj4IECAwWCC4tYOlBoM7GgECBKoIBLd2sFQVHX0QIEBgsEBwawdLDQZ3NAIECFQRCG7tYKkqOvogQIDAYIHg1g6WGgzuaAQIEKgiENzawVJVdPRBgACBwQLBrR0sNRjc0QgQIFBFILi1g6Wq6OiDAAECgwWCWztYajC4oxEgQKCKQHBrB0tV0dEHAQIEBgsEt3aw1GBwRyNAgEAVgeDWDpaqoqMPAgQIDBYIbu1gqcHgjkaAAIEqAsGtHSxVRUcfBAgQGCwQ3NrBUoPBHY0AAQJVBIJbO1iqio4+CBAgMFgguLWDpQaDOxoBAgSqCAS3drBUFR19ECBAYLBAcGsHSw0GdzQCBAhUEQhu7WCpKjr6IECAwGCB4NYOlhoM7mgECBCoIhDc2sFSVXT0QYAAgcECwa0dLDUY3NEIECBQRSC4tYOlqujogwABAoMFgls7WGowuKMRIECgikBwawdLVdHRBwECBAYLBLd2sNRgcEcjQIBAFYHg1g6WqqKjDwIECAwWCG7tYKnB4I5GgACBKgLBrR0sVUVHHwQIEBgsENzawVKDwR2NAAECVQSCWztYqoqOPggQIDBYILi1g6UGgzsaAQIEqggEt3awVBUdfRAgQGCwQHBrB0sNBnc0AgQIVBEIbu1gqSo6+iBAgMBggeDWDpYaDO5oBAgQqCIQ3NrBUlV09EGAAIHBAsGtHSw1GNzRCBAgUEUguLWDparo6IMAAQKDBYJbO1hqMLijESBAoIpAcGsHS1XR0QcBAgQGCwS3drDUYHBHI0CAQBWB4NYOlqqiow8CBAgMFghu7WCpweCORoAAgSoCwa0dLFVFRx8ECBAYLBDc2sFSg8EdjQABAlUEgls7WKqKjj4IECAwWCC4tYOlBoM7GgECBKoIBLd2sFQVHX0QIEBgsEBwawdLDQZ3NAIECFQRCG7tYKkqOvogQIDAYIHg1g6WGgzuaAQIEKgiENzawVJVdPRBgACBwQLBrR0sNRjc0QgQIFBFILi1g6Wq6OiDAAECgwWCWztYajC4oxEgQKCKQHBrB0tV0dEHAQIEBgsEt3aw1GBwRyNAgEAVgeDWDpaqoqMPAgQIDBYIbu1gqcHgjkaAAIEqAsGtHSxVRUcfBAgQGCwQ3NrBUoPBHY0AAQJVBIJbO1iqio4+CBAgMFgguLWDpQaDOxoBAgSqCAS3drBUFR19ECBAYLBAcGsHSw0GdzQCBAhUEQhu7WCpKjr6IECAwGCB4NYOlhoM7mgECBCoIhDc2sFSVXT0QYAAgcECwa0dLDUY3NEIECBQRSC4tYOlqujogwABAoMFgls7WGowuKMRIECgikBwawdLVdHRBwECBAYLBLd2sNRgcEcjQIBAFYHg1g6WqqKjDwIECAwWCG7tYKnB4I5GgACBKgLBrR0sVUVHHwQIEBgsENzawVKDwR2NAAECVQSCWztYqoqOPggQIDBYILi1g6UGgzsaAQIEqggEt3awVBUdfRAgQGCwQHBrB0sNBnc0AgQIVBEIbu1gqSo6+iBAgMBggeDWDpYaDO5oBAgQqCIQ3NrBUlV09EGAAIHBAsGtHSw1GNzRCBAgUEUguLWDparo6IMAAQKDBYJbO1hqMLijESBAoIpAcGsHS1XR0QcBAgQGCwS3drDUYHBHI0CAQBWB4NYOlqqiow8CBAgMFghu7WCpweCORoAAgSoCwa0dLFVFRx8ECBAYLBDc2sFSg8EdjQABAlUEgls7WKqKjj4IECAwWCC4tYOlBoM7GgECBKoIBLd2sFQVHX0QIEBgsEBwawdLDQZ3NAIECFQRCG7tYKkqOvogQIDAYIHg1g6WGgzuaAQIEKgiENzawVJVdPRBgACBwQLBrR0sNRjc0QgQIFBFILi1g6Wq6OiDAAECgwWCWztYajC4oxEgQKCKQHBrB0tV0dEHAQIEBgsEt3aw1GBwRyNAgEAVgeDWDpaqoqMPAgQIDBYIbu1gqcHgjkaAAIEqAsGtHSxVRUcfBAgQGCwQ3NrBUoPBHY0AAQJVBIJbO1iqio4+CBAgMFgguLWDpQaDOxoBAgSqCAS3drBUFR19ECBAYLBAcGsHSw0GdzQCBAhUEQhu7WCpKjr6IECAwGCB4NYOlhoM7mgECBCoIhDc2sFSVXT0QYAAgcECwa0dLDUY3NEIECBQRSC4tYOlqujogwABAoMFgls7WGowuKMRIECgikBwawdLVdHRBwECBAYLBLd2sNRgcEcjQIBAFYHg1g6WqqKjDwIECAwWCG7tYKnB4I5GgACBKgLBrR0sVUVHHwQIEBgsENzawVKDwR2NAAECVQSCWztYqoqOPggQIDBYILi1g6UGgzsaAQIEqggEt3awVBUdfRAgQGCwQHBrB0sNBnc0AgQIVBEIbu1gqSo6+iBAgMBggeDWDpYaDO5oBAgQqCIQ3NrBUlV09EGAAIHBAn9s7eC/HYzmaAQIEJggENz4fgKYMBDOQIDAcwR8ADwnayclQIDAfwn4ADAQBAgQeKiAD4CHBu/YBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAwJUC1/1XQC9VvvKIahMgQGC6wNLCHXDx9DydjwABAn8LDFjZNx/B7BAgQKCTwM0r8rGP6zQTeiVAYJjAYzdv8YMPGzPHIUBgs4CV9zIARC+JXECAQAOBjbusgU60RdRRTsUIEFgXuG0Nrbfmjr/uSQc0AQJPEbh0pzwFcfc5hbg7Ac8n0Ecgvi/6HP1ZnQr6WXk7LYGvBIK7AHJfAWPQNzudE1gTiLzta490dTcBQ9ItMf0S+FrgzfcZLQEjZAYINBN456VtdlTt3ihgrm7E9igCiwLn3s/Fh7icwH8EzJtRIFBCYPVVLNG0JgYJrE7gj+sHnd5RCOwQWH3rdvTomc8SMJPPyttptwgcf822tOehBH4ImFJjQCAscPClCj9VOQJvCBwcWn8u9IaxW6cLHHmLphs4X28BM9w7P91vEfDabGH30OsEXo70dY9WmUAbAe9Jm6g0ui5gvNfN3PEMAe/GM3J2yte/K2ZE4FkC32//Z1k47TMEzPwzcnbKVwLfvAmvbvXPCfQWMPy989P9mwJfvQBvlnU7gUYC3oJGYWk1JmDuY5QK9RfwOvTP0AkOC3w67ofvdiGBgQI+AwaG6kgfBWx/U0HgUwGvhsEYLmDEhwfseO8JeEHe83N3bYGP8127X90RuFvAO3K3uOfdI2Cy73H2lO4C3pTuCer/E4E/xpoRAQJfCXhZzMYoAV9qRsXpMBcLeF8uBlb+XgHfaO719rT2Al6Z9hE6wC8B02wYCCwJeGWWuFxcWsA0l45Hc/UEvDL1MtHRWQHTfFbOfQ8V8Mo8NPiRx/ZLrZGxOtRFAt6Xi2CV3SbgG802eg/uJuBl6ZaYfl8J+FLzSsg/J/AvAW+KOZgpYLJn5upUOQH/dUA5S5WKCRjuYoFop5aAF6RWHrqJCxjxOKmCMwS8GjNydIrvBD6d8h//ITUCTxbwXjw5/Wed3aw/K2+nfSXgjXgl5J+PEzD04yJ1oGWBr94CPxMvU7qhnYDpbxeZhlMChj8lqU5jgW9eA1+CGueq9a8FzLzpIPCPwPfvg48BszJGwKiPidJBwgLejTCocpUEjHelNPRSVeDle+IHgqrR6etzASNtMgisCXhn1rxcXU/gyAz7NlMvNx2VEfAKlYlCI0cFDg6t1X8U1HUPF/BGPXwAWhzflLaISZNdBY6/YL5bdc24Yd/GsmFoWm4rsPS+/by47Vk1XlTAEBYNRlvPETjxEvoweM54xE9q3uKkChIICJx7M/1wEKCfXuL0aE2HcT4C9QROv64+DOqFuacjI7TH3VMJZAXefJN9JGTjqFnNkNTMRVcEkgKR99zvD5KRbKqVmgTDsClAjyXwnkBwBfgp4b0orr07HrSlf21gqhO4WeCKHeFT4eYQfzxOjvebeyKBUQLXLZE/Ko9Su/Ew9wR044E8igCBwgL3bJyPTylMcmFrtC/EVZoAgfcFdi2pg899/4CpCgcbvv+y1AHVIUCAwL8E7t9innhEwHQSIEBgj8CRDeWalMCejD2VAAECqwKprfe0OqvOridAgEA/gadtdn9xtt+M6pgAgWoCRT45qrHohwABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAkmB/wdiN+SyusLZHQAAAABJRU5ErkJggg==";
      //wait(1000);
      //window.setTimeout(draw,200);

    }

    function loadTexture(image,texture, gl)
    {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // Option 1 : Use mipmap, select interpolation mode
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);
      }
    

	
    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["test-vs", "test-fs"]);
			this.texture = setUpTexture(gl);
            initTexture(this.texture, gl);
        }
		var a=0.5;
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5, .5,-.5,  
					-.5,-.5,-.5,  -.5,.5,-.5,  .5, .5,-.5, 
					
					 -.5,-.5,.5,  .5,-.5,.5,  .5, .5,.5,  
					-.5,-.5,.5,  -.5,.5,.5,  .5, .5,.5, 
					
					a,-a,a,  a,-a,-a, a,a,-a,
					a,-a,a,  a,a,a,   a,a,-a,
					
					-a,-a,a,  -a,-a,-a, -a,a,-a,
					-a,-a,a,  -a,a,a,   -a,a,-a,
					
					-a,a,a, a,a,a,  a,a,-a,
					-a,a,a , -a,a,-a, a,a,-a,
					
					-a,-a,a, a,-a,a,  a,-a,-a,
					-a,-a,a , -a,-a,-a, a,-a,-a,
					
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,
					0,0,-1, 0,0,-1, 0,0,-1,

					0,0,1, 0,0,1, 0,0,1,
					0,0,1, 0,0,1, 0,0,1,	
						
					1,0,0,  1,0,0,  1,0,0,	
					1,0,0,  1,0,0,  1,0,0,	
					
					-1,0,0,  -1,0,0,  -1,0,0,	
					-1,0,0,  -1,0,0,  -1,0,0,	
					
					0,1,0, 	0,1,0,	0,1,0,
					0,1,0,	0,1,0,	0,1,0,
					
					0,1,0,	0,1,0,	0,1,0,
					0,-1,0,	0,-1,0,	0,-1,0,
					
                ]},
				
				uvs: {numComponents:2, data: [
                    0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,  

					0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,  
					
					0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,  
	
					0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,  
			
					0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,  
					0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,  
					
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
	
	/*
    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["test-vs", "test-fs"]);
            this.texture = setUpTexture(gl);
            initTexture(this.texture, gl);

        }
    };*/
	
    Cube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
		
		shaderProgram.program.texSampler1 = gl.getUniformLocation(shaderProgram.program, "texSampler1");
		gl.uniform1i(shaderProgram.program.texSampler1, 0);
		
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
			
			
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);	
			
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Cube.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
grobjects.push(new Cube("cube1",[3,1.0,-2.0],2,[1,0,1]) );
