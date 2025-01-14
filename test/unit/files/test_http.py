import io
import os
import urllib
from typing import Any
from unittest import mock

from ._util import (
    assert_realizes_as,
    assert_realizes_contains,
    configured_file_sources,
    user_context_fixture,
)

SCRIPT_DIRECTORY = os.path.abspath(os.path.dirname(__file__))
FILE_SOURCES_CONF = os.path.join(SCRIPT_DIRECTORY, "http_file_sources_conf.yml")


def test_file_source_http_specific():
    def check_specific_header(request, **kwargs):
        assert request.headers["Authorization"] == "Bearer IBearTokens"
        response: Any = io.StringIO("hello specific world")
        response.headers = {}
        return response

    with mock.patch.object(urllib.request, "urlopen", new=check_specific_header):
        test_url = "https://www.usegalaxy.org/myfile.txt"
        user_context = user_context_fixture()
        file_sources = configured_file_sources(FILE_SOURCES_CONF)
        file_source_pair = file_sources.get_file_source_path(test_url)

        assert file_source_pair.path == test_url
        assert file_source_pair.file_source.id == "test1"

        assert_realizes_as(file_sources, test_url, "hello specific world", user_context=user_context)


def test_file_source_another_http_specific():
    def check_another_header(request, **kwargs):
        assert request.headers["Another_header"] == "found"
        response: Any = io.StringIO("hello another world")
        response.headers = {}
        return response

    with mock.patch.object(urllib.request, "urlopen", new=check_another_header):
        test_url = "http://www.galaxyproject.org/anotherfile.txt"
        user_context = user_context_fixture()
        file_sources = configured_file_sources(FILE_SOURCES_CONF)
        file_source_pair = file_sources.get_file_source_path(test_url)

        assert file_source_pair.path == test_url
        assert file_source_pair.file_source.id == "test2"

        assert_realizes_as(file_sources, test_url, "hello another world", user_context=user_context)


def test_file_source_http_generic():
    def check_generic_headers(request, **kwargs):
        assert not request.headers
        response: Any = io.StringIO("hello generic world")
        response.headers = {}
        return response

    with mock.patch.object(urllib.request, "urlopen", new=check_generic_headers):
        test_url = "https://www.elsewhere.org/myfile.txt"
        user_context = user_context_fixture()
        file_sources = configured_file_sources(FILE_SOURCES_CONF)
        file_source_pair = file_sources.get_file_source_path(test_url)

        assert file_source_pair.path == test_url
        assert file_source_pair.file_source.id == "test3"

        assert_realizes_as(file_sources, test_url, "hello generic world", user_context=user_context)


def test_file_source_ftp_url():
    def check_generic_headers(request, **kwargs):
        assert not request.headers
        response: Any = io.StringIO("This is ftp.gnu.org, the FTP server of the the GNU project.")
        response.headers = {}
        return response

    with mock.patch.object(urllib.request, "urlopen", new=check_generic_headers):
        test_url = "ftp://ftp.gnu.org/README"
        user_context = user_context_fixture()
        file_sources = configured_file_sources(FILE_SOURCES_CONF)
        file_source_pair = file_sources.get_file_source_path(test_url)

        assert file_source_pair.path == test_url
        assert file_source_pair.file_source.id == "test3"

        assert_realizes_contains(
            file_sources,
            test_url,
            "This is ftp.gnu.org, the FTP server of the the GNU project.",
            user_context=user_context,
        )
