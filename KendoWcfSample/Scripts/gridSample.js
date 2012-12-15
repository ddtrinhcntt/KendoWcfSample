﻿(function(window, $, kendo) {
    var getGenresAsync = function () {
        var deferred = $.Deferred(),

            loadGenres = function () {
                new kendo.data.DataSource({
                    type: "odata",
                    serverPaging: false,
                    transport: {
                        read: "/Services/MusicStore.svc/Genres?$select=GenreId,Name"
                    },
                    schema: {
                        data: function (data) {
                            return data.value;
                        },
                        total: function (data) {
                            return data["odata.count"];
                        }
                    }
                }).fetch(function (data) {
                    deferred.resolve($.map(data.items, function (item) {
                        return {
                            value: item.GenreId,
                            text: item.Name
                        };
                    }));
                });
            };

        window.setTimeout(loadGenres, 1);
        return deferred.promise();
    };

    var getArtistsAsync = function () {
        var deferred = $.Deferred(),

            loadArtists = function () {
                new kendo.data.DataSource({
                    type: "odata",
                    serverPaging: false,
                    transport: {
                        read: "/Services/MusicStore.svc/Artists?$select=ArtistId,Name"
                    },
                    schema: {
                        data: function (data) {
                            return data.value;
                        },
                        total: function (data) {
                            return data["odata.count"];
                        }
                    }
                }).fetch(function (data) {
                    deferred.resolve($.map(data.items, function (item) {
                        return {
                            value: item.ArtistId,
                            text: item.Name
                        };
                    }));
                });
            };

        window.setTimeout(loadArtists, 1);
        return deferred.promise();
    };

    var albumModel = {
        id: "AlbumId",
        fields: {
            AlbumId: {
                //editable: false,
                type: "number",
                defaultValue: 0
            },
            ArtistId: {
                type: "number",
                defaultValue: 1
            },
            GenreId: {
                type: "number",
                defaultValue: 1
            },
            Title: {
                type: "string",
                validation: {
                    required: true,
                    minlength: 2,
                    maxlength: 160
                }
            },
            Price: {
                type: "number",
                defaultValue: 9.99,
                validation: {
                    min: 0.01,
                    max: 100.00
                }
            },
            AlbumArtUrl: {
                type: "string",
                validation: {
                    maxlength: 1024
                }
            }
        }
    };

    var gridDataSource = new kendo.data.DataSource({
        type: "odata",
        serverFiltering: true,
        serverPaging: true,
        serverSorting: true,
        pageSize: 20,
        transport: {
            read: {
                url: "/Services/MusicStore.svc/Albums"
            },
            create: {
                url: "/Services/MusicStore.svc/Albums",
                type: "POST"
            },
            update: {
                url: function (data) {
                    return "/Services/MusicStore.svc/Albums(" + data.AlbumId + ")";
                },
                type: "PUT"
            },
            destroy: {
                url: function (data) {
                    return "/Services/MusicStore.svc/Albums(" + data.AlbumId + ")";
                },
                type: "DELETE"
            }
        },

        schema: {
            model: albumModel,
            parse: function (response) {
                if (response) {
                    if(response.value) {
                        $.each(response.value, function(item) {
                            delete item["odata.metadata"];
                        });
                    } else {
                        delete response["odata.metadata"];
                    }
                }
                return response;
            },
            data: function (data) {
                if (data.value) {
                    return data.value;
                }
                return data;
            },
            total: function (data) {
                if (data === undefined) {
                    return 0;
                } else if (data["odata.count"]) {
                    return data["odata.count"];
                } else if (data instanceof Array) {
                    return data.length;
                }
                return 1;
            }
        }
    });

    $.when(getGenresAsync(), getArtistsAsync()).done(function (genres, artists) {
        $("#grid").kendoGrid({
            editable: "inline",
            filterable: true,
            pageable: true,
            sortable: true,
            dataSource: gridDataSource,
            toolbar: ["create"],
            columns: [
                { field: "ArtistId", values: artists },
                { field: "GenreId", values: genres },
                { field: "Title" },
                { field: "Price" },
                { command: ["edit", "destroy"], title: "&nbsp;" }
            ]
        });
    });
})(window, jQuery, kendo)