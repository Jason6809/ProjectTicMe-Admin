app.directive('hashtagify', ['$timeout', '$compile',
    function($timeout, $compile) {
        return {
            restrict: 'A',
            scope: {
                atClick: '&atLink',
                hashClick: '&hashLink',
                hashtagify: '='
            },
            link: function(scope, element, attrs) {
                scope.$watch('hashtagify', function(value) {
                    const TAG = 'hashtagify: ';

                    var html = scope.hashtagify;

                    if (html === '') {
                        return false;
                    } else {
                        html = html.replace(/(|\s)*\+(\w+)/g, '$1<span class="point-ref">+$2</span>');
                    }

                    if (attrs.atLink) {
                        html = html.replace(/(|\s)*@(\w+)/g, '$1<a ng-click="atClick({$event: $event})" class="user-ref">@$2</a>');
                    }

                    if (attrs.hashLink) {
                        html = html.replace(/(^|\s)*#(\w+)/g, '$1<a ng-click="hashClick({$event: $event})" class="hashtag-link">#$2</a>');
                    }

                    element.html(html);

                    $compile(element.contents())(scope);

                    console.log(TAG);
                    console.log(value);
                });

                // $timeout(function() {
                //     var html = scope.target;

                //     if (html === '') {
                //         return false;
                //     }

                //     if (attrs.atLink) {
                //         html = html.replace(/(|\s)*@(\w+)/g, '$1<a ng-click="atClick({$event: $event})" class="hashtag-link">@$2</a>');
                //     }

                //     if (attrs.hashLink) {
                //         html = html.replace(/(^|\s)*#(\w+)/g, '$1<a ng-click="hashClick({$event: $event})" class="hashtag-link">#$2</a>');
                //     }

                //     element.html(html);

                //     $compile(element.contents())(scope);
                // }, 100);
            }
        };
    }
]);