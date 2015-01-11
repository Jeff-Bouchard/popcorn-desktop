(function (App) {
	'use strict';

    var collection = path.join(require('nw.gui').App.dataPath + '/TorrentCollection/'),
		files;

	var TorrentCollection = Backbone.Marionette.ItemView.extend({
		template: '#torrent-collection-tpl',
		className: 'torrent-collection',

		events: {
			'click .file-item': 'openFileSelector',
			'click .item-delete': 'deleteItem',
			'click .collection-delete': 'clearCollection',
			'click .collection-open': 'openCollection'
		},

		initialize: function () {			
			if (!fs.existsSync(collection)) fs.mkdir(collection) //create directory
			this.files = fs.readdirSync(collection);
		},

		onShow: function () {
			Mousetrap.bind(['esc', 'backspace'], function (e) {
				App.vent.trigger('torrentCollection:close');
			});

			$('#movie-detail').hide();
			$('#nav-filters').hide();

			this.render();

			this.$('.tooltipped').tooltip({
				delay: {
					'show': 800,
					'hide': 100
				}
			});
		},

		onRender: function () {
			if (this.files[0]) {
				$('.notorrents-info').css('display','none');
				$('.collection-actions').css('display','block');
				$('.torrents-info').css('display','block');
			}
		},

		openFileSelector: function (e) {
			var _file = $(e.currentTarget).context.innerText,
				file = _file.substring(0, _file.length-1); // avoid ENOENT

            if (_file.indexOf('.torrent') !== -1) {
                Settings.droppedTorrent = file;
    			handleTorrent(collection + file);
            } else { // assume magnet
                var content = fs.readFileSync(collection + file, 'utf8');
                Settings.droppedMagnet = content;
    			handleTorrent(content);
            }
		},

		deleteItem: function (e) {
			e.preventDefault();
			e.stopPropagation();

			var _file = $(e.currentTarget.parentNode).context.innerText,
				file = _file.substring(0, _file.length-1); // avoid ENOENT

			fs.unlinkSync(collection + file);

			// update collection
			this.files = fs.readdirSync(collection); 
			this.render();
		},

		clearCollection: function () {
			if (fs.existsSync(collection)) {
				fs.readdirSync(collection).forEach(
					function(file,index){
						var curPath = collection + "/" + file;

						if(fs.lstatSync(curPath).isDirectory()) { // recurse
							deleteFolderRecursive(curPath);
						} else { // delete file
							fs.unlinkSync(curPath);
						}

					});
				fs.rmdirSync(collection);
			}
			App.vent.trigger('torrentCollection:show');
		},

		openCollection: function () {
			console.log('Opening: ' + collection);
			gui.Shell.openItem(collection);
		},

		onClose: function () {
			Mousetrap.unbind(['esc', 'backspace']);
			$('#movie-detail').show();
			$('#nav-filters').show();
		},

		closeTorrentCollection: function () {
			App.vent.trigger('torrentCollection:close');
		}

	});

	App.View.TorrentCollection = TorrentCollection;
})(window.App);