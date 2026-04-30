from app.main import app as fastapi_app


class ApiPrefixAdapter:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            path = scope.get("path", "")
            if path == "/api" or path.startswith("/api/"):
                adjusted = dict(scope)
                adjusted["path"] = path[4:] or "/"
                adjusted["root_path"] = f"{scope.get('root_path', '')}/api"
                scope = adjusted
        await self.app(scope, receive, send)


app = ApiPrefixAdapter(fastapi_app)
