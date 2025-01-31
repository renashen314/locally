defmodule Search.Meilisearch do
  def search(query) do
    case Req.get!("http://localhost:7700/indexes/movies/search", params: %{q: query}) do
      %{status: 200, body: body} ->
        {:ok, body}

      %{status: status, body: body} ->
        {:ok, {status, body}}

      {:error, error} ->
        error
    end
  end
end
